import fastDeepEqual from "fast-deep-equal"
import { observable, action, makeObservable, toJS, when } from "mobx"
import { PersistStoreMap, hydrateStore, isPersisting, makePersistable, stopPersisting } from "mobx-persist-store"
import toast from "react-hot-toast"
import { type Node } from "reactflow"
import { merge } from "ts-deepmerge"

import { StorageKeys } from "src/constants/storage-keys"
import { AppletType } from "src/enums/applet-type"
import { appletComponentService } from "src/services/applet-component-service"
import { appletStore } from "src/services/applet-store"
import { sessionStore } from "src/services/session-store"
import { StorageManager } from "src/services/storage-manager"
import { type AppletActionParams, type AppletFieldErrors } from "src/types/AppletAction"
import { type AppletInput } from "src/types/AppletInput"
import { type AppletOption } from "src/types/AppletOption"
import { type AppletOutput } from "src/types/AppletOutput"
import { type AppletPreset } from "src/types/AppletPreset"
import { type AppletState } from "src/types/AppletState"
import { type ExtensionMetadata } from "src/types/ExtensionMetadata"
import { type LayoutSetting } from "src/types/LayoutSetting"
import { type Session } from "src/types/Session"
import { type HistoryBlob, type SessionHistorySnapshot, type SessionHistoryValue } from "src/types/SessionHistory"
import { extractBinaryValues } from "src/utils/applet/extract-binary-values"
import { getErrorMessage } from "src/utils/common/get-error-message"
import { runExtension } from "src/utils/extension/run-extension"
import { runPipeline } from "src/utils/pipeline/run-pipeline"
import { generateRandomString } from "src/utils/text/generate-random-string"
import { isLargeText } from "src/utils/text/is-large-text"

import { type AppletConstructor } from "./AppletConstructor.js"

type ViewMode = "main" | "pipeline"
type FieldType = "input" | "output"

interface SetValueOptions {
  markAsModified: boolean
}

const MARK_AS_MODIFIED: SetValueOptions = { markAsModified: true }

/**
 * Delay before a running action is shown as running, so quick runs don't flash
 * a spinner
 */
const RUNNING_INDICATOR_DELAY = 200

/**
 * Minimum auto run delay when an input holds large text, running on every
 * keystroke would freeze the UI
 */
const LARGE_INPUT_AUTO_RUN_DELAY = 400

/**
 * Applet, a small program that performs a specific task.
 *
 * One instance is one open tab (session) of a tool: its field values, how its
 * fields are shown, and how it runs.
 */
export class Applet<
  InputFields extends Record<string, any> = any,
  OutputFields extends Record<string, any> = any,
  OptionKeys extends Record<string, any> = any
> {
  // ---------------------------------------------------------------------------
  // Definition, from the tool's constructor
  // ---------------------------------------------------------------------------

  readonly appletId: string
  readonly type: AppletType
  readonly name: string
  readonly description: string = ""
  readonly category: string
  readonly layoutSetting: LayoutSetting
  readonly metadata?: ExtensionMetadata
  readonly presets: Array<AppletPreset<InputFields>> = []
  readonly options: Array<AppletOption<OptionKeys>>
  readonly action: (actionParams: AppletActionParams<InputFields, OptionKeys, OutputFields>) => any

  /**
   * Fields can be a fixed list, or computed from the current input values
   */
  readonly inputFields: Array<AppletInput<InputFields>> | ((inputValues: any) => Array<AppletInput<InputFields>>)
  readonly outputFields: Array<AppletOutput<OutputFields>> | ((inputValues: any) => Array<AppletOutput<OutputFields>>)

  /**
   * Run the action whenever an input changes. Defaults to true, except for
   * pipelines
   */
  readonly autoRun: boolean = false
  autoRunDelay: number = 0

  /**
   * Only one tab of this tool may be open at a time
   */
  readonly disableMultipleSession: boolean = false

  /**
   * The default input values come from a preset instead of the tool itself
   */
  readonly hasOverriddenDefaultState: boolean = false

  /**
   * Don't save this session to storage, used for throwaway runs such as
   * pipeline steps
   */
  readonly disablePersistence: boolean = false

  /**
   * Read by mobx-persist-store when hydrating, see `setupPersistence`
   */
  readonly state?: AppletState = undefined

  // ---------------------------------------------------------------------------
  // Session (tab)
  // ---------------------------------------------------------------------------

  readonly sessionId: string
  sessionName?: string

  /**
   * Number shown after the tool name when several tabs of it are open
   */
  sessionSequenceNumber?: number

  @observable isDeleted: boolean = false

  // ---------------------------------------------------------------------------
  // Values
  // ---------------------------------------------------------------------------

  @observable inputValues: any = {}
  @observable outputValues: any = {}
  @observable optionValues: any = {}

  /**
   * Errors the last run reported per field, shown as a badge on the field
   */
  @observable fieldErrors: AppletFieldErrors = {}

  isInputValuesModified: boolean = false
  isOutputValuesModified: boolean = false

  /**
   * UI state of each field component, such as scroll position, selection and
   * zoom, keyed by field key
   */
  @observable inputFieldsState: Record<string, any> = {}
  @observable outputFieldsState: Record<string, any> = {}

  // ---------------------------------------------------------------------------
  // Running
  // ---------------------------------------------------------------------------

  @observable actionRunCount: number = 0
  @observable isActionRunning: boolean = false

  /**
   * Same as `isActionRunning`, but only turns on after the run has taken a
   * moment. Use this one to show a running indicator
   */
  @observable isActionRunningDebounced: boolean = false

  /**
   * True until the first auto run, which runs on the default values and so
   * shouldn't count as a modification or a run
   */
  isAutoRunAndFirstTime: boolean = false

  private autoRunTimeout?: NodeJS.Timeout
  private runningIndicatorTimeout?: NodeJS.Timeout

  /**
   * The run waiting for the current one to finish, see `runWhenIdle`
   */
  private queuedRun?: { runValues: Record<string, unknown>, promise: Promise<void> }

  // ---------------------------------------------------------------------------
  // Batch mode: run once per line of one input field
  // ---------------------------------------------------------------------------

  @observable isBatchModeEnabled: boolean = false
  @observable batchModeInputKey: string = ""
  @observable batchModeOutputKey: string = ""

  // ---------------------------------------------------------------------------
  // View
  // ---------------------------------------------------------------------------

  @observable viewMode: ViewMode

  @observable maximizedField = {
    enabled: false,
    type: "",
    key: ""
  }

  static empty() {
    return new Applet({
      name: "",
      appletId: "",
      category: "",
      action: () => ({}),
      inputFields: [],
      outputFields: []
    })
  }

  constructor(
    appletConstructor: AppletConstructor<InputFields, OutputFields>,
    options: {
      initialState?: Partial<AppletState>
      disablePersistence?: boolean
    } = {}
  ) {
    const isPipeline = appletConstructor.type === AppletType.Pipeline

    this.appletId = appletConstructor.appletId
    this.sessionId = options.initialState?.sessionId ?? (
      this.appletId === ""
        ? ""
        : this.appletId.concat(generateRandomString(10, "1234567890qwertyuiopasdfghjklzxcvbnm"))
    )
    this.name = appletConstructor.name
    this.description = appletConstructor.description ?? ""
    this.category = appletConstructor.category
    this.type = appletConstructor.type ?? AppletType.Tool
    this.metadata = appletConstructor.metadata
    this.action = appletConstructor.action ?? (() => ({}))
    this.inputFields = appletConstructor.inputFields
    this.outputFields = appletConstructor.outputFields
    this.options = appletConstructor.options ?? []
    this.presets = appletConstructor.presets ?? []
    this.autoRun = isPipeline ? false : appletConstructor.autoRun ?? true
    this.isAutoRunAndFirstTime = this.autoRun
    this.disableMultipleSession = appletConstructor.disableMultipleSession ?? !sessionStore.enableMultipleSession
    this.hasOverriddenDefaultState = appletConstructor.hasOverriddenDefaultState ?? false
    this.disablePersistence = options.disablePersistence ?? false
    this.viewMode = isPipeline ? "pipeline" : "main"
    this.inputValues = this.getInputValuesWithDefault()
    this.optionValues = this.getOptionValuesWithDefault()

    // By default inputs sit beside outputs, and fields stack top to bottom
    this.layoutSetting = {
      areaType: "flex",
      areaFlexDirection: "horizontal",
      fieldsType: "flex",
      fieldsInputFlexDirection: "vertical",
      fieldsOutputFlexDirection: "vertical",
      ...appletConstructor.layoutSetting ?? {}
    }

    if (options.initialState) {
      this.restoreState(options.initialState)
    }

    // A tool with a single tab is simply named after the tool
    if (this.disableMultipleSession && this.appletId !== "") {
      this.sessionName = appletStore.mapOfLoadedApplets[this.appletId].name
    }

    makeObservable(this)
    this.setupPersistence()
  }

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------

  private restoreState(state: Partial<AppletState>) {
    this.sessionName = state.sessionName ?? this.sessionName
    this.sessionSequenceNumber = state.sessionSequenceNumber ?? this.sessionSequenceNumber
    this.inputValues = Object.assign(this.inputValues, state.inputValues)
    this.outputValues = Object.assign(this.outputValues, state.outputValues)
    this.isBatchModeEnabled = state.isBatchModeEnabled ?? this.isBatchModeEnabled
    this.batchModeInputKey = state.batchModeInputKey ?? this.batchModeInputKey
    this.batchModeOutputKey = state.batchModeOutputKey ?? this.batchModeOutputKey
    this.actionRunCount = state.actionRunCount ?? this.actionRunCount
    this.isOutputValuesModified = state.isOutputValuesModified ?? this.isOutputValuesModified
    this.isInputValuesModified = state.isInputValuesModified ?? this.isInputValuesModified
    this.isDeleted = state.isDeleted ?? this.isDeleted
    this.inputFieldsState = state.inputFieldsState ?? this.inputFieldsState
    this.outputFieldsState = state.outputFieldsState ?? this.outputFieldsState
    this.fieldErrors = state.fieldErrors ?? this.fieldErrors
    this.isAutoRunAndFirstTime = state.isAutoRunAndFirstTime ?? this.isAutoRunAndFirstTime
    this.optionValues = state.optionValues ?? this.optionValues
    this.viewMode = state.viewMode ?? this.viewMode
    this.maximizedField = state.maximizedField ?? this.maximizedField
  }

  /**
   * Saves the session to storage on every change, as one `state` property
   * built by `toState`
   */
  private setupPersistence() {
    // Forget any earlier store registered for this session id
    Array.from(PersistStoreMap.keys()).forEach((store) => {
      if (store?.sessionId === this.sessionId) {
        PersistStoreMap.delete(store)
      }
    })

    if (!this.appletId || this.disablePersistence) {
      return
    }

    void makePersistable(
      this,
      {
        name: StorageKeys.AppletState.concat(this.sessionId),
        properties: [
          {
            key: "state",
            serialize: () => this.toState(),
            deserialize: () => this.state
          }
        ]
      },
      { delay: 100 }
    )
  }

  async hydrateStore() {
    await hydrateStore(this)
  }

  stopStore() {
    stopPersisting(this)
  }

  toState(): AppletState {
    return {
      appletId: this.appletId,
      sessionId: this.sessionId,
      sessionName: this.sessionName,
      sessionSequenceNumber: this.sessionSequenceNumber,
      // Time of this snapshot, kept under its original name for stored state
      createdAt: new Date().getTime(),
      isDeleted: this.isDeleted,
      inputValues: toJS(this.inputValues),
      outputValues: toJS(this.outputValues),
      optionValues: toJS(this.optionValues),
      fieldErrors: toJS(this.fieldErrors),
      isInputValuesModified: this.isInputValuesModified,
      isOutputValuesModified: this.isOutputValuesModified,
      inputFieldsState: toJS(this.inputFieldsState),
      outputFieldsState: toJS(this.outputFieldsState),
      actionRunCount: this.actionRunCount,
      isAutoRunAndFirstTime: this.isAutoRunAndFirstTime,
      isBatchModeEnabled: this.isBatchModeEnabled,
      batchModeInputKey: this.batchModeInputKey,
      batchModeOutputKey: this.batchModeOutputKey,
      viewMode: this.viewMode,
      maximizedField: toJS(this.maximizedField)
    }
  }

  toSession(): Session {
    const { sessionId, sessionName, sessionSequenceNumber, appletId } = this

    return { sessionId, sessionName, sessionSequenceNumber, appletId }
  }

  /**
   * Builds the closed tab history entry for this session.
   *
   * Input and output values are stored separately from the rest of the state,
   * each as searchable text. Files and buffers inside the values are replaced
   * by placeholders, and their bytes are returned as `blobs`.
   */
  async toHistory(): Promise<{ history: SessionHistorySnapshot, blobs: HistoryBlob[] }> {
    const { sessionId, sessionName, appletId } = this

    const { value: storableState, blobs } = await extractBinaryValues({ ...this.toState(), isDeleted: false })
    const { inputValues, outputValues, ...state } = storableState

    const values: SessionHistoryValue[] = [
      ...Object.entries(inputValues ?? {}).map(([key, value]) => ({ source: "input" as const, key, value })),
      ...Object.entries(outputValues ?? {}).map(([key, value]) => ({ source: "output" as const, key, value }))
    ]
      .filter(({ value }) => value !== undefined && value !== null)
      .map(({ source, key, value }) => (
        typeof value === "string"
          ? { source, key, kind: "text", text: value }
          : { source, key, kind: "json", text: JSON.stringify(value) }
      ))

    return {
      history: {
        deletedAt: new Date().getTime(),
        sessionId,
        sessionName,
        appletId,
        toolName: appletStore.mapOfLoadedAppletsName[appletId] ?? appletId,
        state,
        values
      },
      blobs
    }
  }

  // ---------------------------------------------------------------------------
  // Session
  // ---------------------------------------------------------------------------

  @action
  setSessionName(value: string) {
    this.sessionName = value
  }

  @action
  setSessionSequenceNumber(value?: number) {
    this.sessionSequenceNumber = value
  }

  @action
  setIsDeleted(isDeleted: boolean) {
    this.isDeleted = isDeleted
  }

  @action
  async markAsDeleted() {
    this.setIsDeleted(true)
    this.resetInputAndOutputFieldsState()

    // A closed pipeline reopens in the editor
    if (this.type === AppletType.Pipeline) {
      this.setViewMode("pipeline")
    }

    // A tab closed while not active (Close Others, Close All, ...) isn't being
    // persisted, so write the change to storage directly
    if (!isPersisting(this)) {
      await StorageManager.updateAppletStatePropertyInStorage(this.sessionId, {
        inputFieldsState: {},
        outputFieldsState: {},
        isDeleted: true,
        viewMode: this.viewMode
      })
    }
  }

  // ---------------------------------------------------------------------------
  // Fields
  // ---------------------------------------------------------------------------

  getInputFields(): Array<AppletInput<InputFields>> {
    if (this.isPipelineInMainView()) {
      return this.getPipelineFields("appletInput")
    }

    return typeof this.inputFields === "function"
      ? this.inputFields(this.inputValues)
      : this.inputFields
  }

  getOutputFields(): Array<AppletOutput<OutputFields>> {
    if (this.isPipelineInMainView()) {
      return this.getPipelineFields("appletOutput")
    }

    return typeof this.outputFields === "function"
      ? this.outputFields(this.inputValues)
      : this.outputFields
  }

  private isPipelineInMainView() {
    return this.type === AppletType.Pipeline && this.viewMode === "main"
  }

  /**
   * A pipeline's own fields are its input or output nodes
   */
  private getPipelineFields(nodeType: "appletInput" | "appletOutput") {
    const nodes: Node[] = this.inputValues?.$PIPELINE?.nodes ?? []

    return nodes
      .filter((node) => node.type === nodeType)
      .map((node) => ({
        key: node.data.key,
        label: node.data.label,
        component: node.data.component
      }))
  }

  /**
   * Input fields a dropped or opened file can be read into.
   *
   * Returns the fields, and whether they're only readable in batch mode (no
   * field reads files normally, but a batch field's batch component does).
   */
  getInputFieldsWithReadableFile(): [Array<AppletInput<InputFields>>, boolean] {
    const inputFields = this.getInputFields()
    const canReadFile = (field: AppletInput<InputFields>, isBatch: boolean) => (
      !!appletComponentService.getInputComponent(field.component, isBatch).readFileAs
    )

    const readableFields = inputFields.filter((field) => canReadFile(field, false))
    if (readableFields.length > 0) {
      return [readableFields, false]
    }

    if (!inputFields.some((field) => field.allowBatch)) {
      return [[], false]
    }

    return [inputFields.filter((field) => canReadFile(field, true)), true]
  }

  // ---------------------------------------------------------------------------
  // Input, output and option values
  // ---------------------------------------------------------------------------

  getInputValue(key: string) {
    return this.inputValues[key]
  }

  getOutputValue(key: string) {
    return this.outputValues[key]
  }

  @action
  setInputValue(key: string, value: unknown, options = MARK_AS_MODIFIED) {
    const newInputValues = { ...this.inputValues, [key]: value }

    // File has no enumerable keys, so deep equal treats any two files as equal
    const isFileValue = value instanceof File || (Array.isArray(value) && value.some((item) => item instanceof File))

    if (isFileValue || !fastDeepEqual(this.inputValues, newInputValues)) {
      this.inputValues = newInputValues
    }

    this.markInputModified(options)
  }

  @action
  setInputValues(inputValues: any, options = MARK_AS_MODIFIED) {
    this.inputValues = inputValues
    this.markInputModified(options)
  }

  @action
  setInputValuesMerge(inputValues: any, options = MARK_AS_MODIFIED) {
    this.setInputValues(merge(this.inputValues, inputValues), options)
  }

  @action
  setOutputValue(key: string, value: unknown, options = MARK_AS_MODIFIED) {
    this.setOutputValues({ ...this.outputValues, [key]: value }, options)
  }

  @action
  setOutputValues(outputValues: any, options = MARK_AS_MODIFIED) {
    this.outputValues = outputValues

    if (!this.isAutoRunAndFirstTime) {
      this.isOutputValuesModified = options.markAsModified
    }
  }

  private markInputModified(options: SetValueOptions) {
    if (!this.isAutoRunAndFirstTime) {
      this.isInputValuesModified = options.markAsModified
    }
  }

  /**
   * Sets an option, and re-runs the tool if it auto runs
   */
  @action
  setOptionValue(key: string, value: unknown) {
    this.optionValues = { ...this.optionValues, [key]: value }
    this.runAfterOptionChange()
  }

  /**
   * Restores every option to its default, and re-runs the tool if it auto runs
   */
  @action
  resetOptionValues() {
    this.optionValues = this.getOptionValuesWithDefault()
    this.runAfterOptionChange()
  }

  /**
   * An option change re-runs an auto run tool only when it has input to run
   * on. That's input the user edited, or input the tab was opened with (a
   * dropped file, files sent by an extension), which isn't marked as modified.
   */
  private runAfterOptionChange() {
    if (this.autoRun && (this.isInputValuesModified || this.getIsInputHasValues())) {
      void this.run()
    }
  }

  @action
  resetInputAndOutputValues() {
    this.inputValues = this.getInputValuesWithDefault()
    this.outputValues = {}
    this.fieldErrors = {}
  }

  getInputValuesWithDefault() {
    return Object.fromEntries(this.getInputFields().map((field) => [field.key, field.defaultValue]))
  }

  getOptionValuesWithDefault() {
    return Object.fromEntries(this.options.map((option) => [option.key, option.defaultValue]))
  }

  getIsInputHasValues(): boolean {
    const inputFields = this.getInputFields()

    return Object.entries(this.inputValues).some(([key, value]) => (
      Boolean(value) && !inputFields.find((field) => field.key === key)?.skipValidateHasValue
    ))
  }

  getIsInputOrOutputHasValues(): boolean {
    return this.getIsInputHasValues() || Object.values(this.outputValues).some(Boolean)
  }

  @action
  setFieldErrors(fieldErrors: AppletFieldErrors) {
    this.fieldErrors = fieldErrors
  }

  getFieldError(type: FieldType, key: string): string | undefined {
    return this.fieldErrors[type]?.[key]
  }

  // ---------------------------------------------------------------------------
  // Field UI state
  // ---------------------------------------------------------------------------

  @action
  setInputFieldState(key: string, state: unknown) {
    if (!this.isDeleted) {
      this.inputFieldsState = { ...this.inputFieldsState, [key]: state }
    }
  }

  @action
  setOutputFieldState(key: string, state: unknown) {
    if (!this.isDeleted) {
      this.outputFieldsState = { ...this.outputFieldsState, [key]: state }
    }
  }

  @action
  resetInputAndOutputFieldsState() {
    this.inputFieldsState = {}
    this.outputFieldsState = {}
  }

  // ---------------------------------------------------------------------------
  // Maximized field and view mode
  // ---------------------------------------------------------------------------

  /**
   * Maximizes a field, or restores it if it's already the maximized one
   */
  @action
  toggleMaximizedFieldKey(options: typeof this.maximizedField) {
    const { enabled, type, key } = this.maximizedField
    const isSameField = enabled === options.enabled && type === options.type && key === options.key

    this.maximizedField = isSameField ? { ...options, enabled: false } : options
  }

  /**
   * Input and output fields that can be maximized, inputs first
   */
  getMaximizableFields() {
    const { isBatchModeEnabled } = this

    const inputs = this.getInputFields()
      .filter((field) => appletComponentService.getInputComponent(field.component, isBatchModeEnabled).maximizable)
      .map((field) => ({ type: "input", key: field.key, label: field.label || field.key }))

    const outputs = this.getOutputFields()
      .filter((field) => appletComponentService.getOutputComponent(field.component, isBatchModeEnabled).maximizable)
      .map((field) => ({ type: "output", key: field.key, label: field.label || field.key }))

    return [...inputs, ...outputs]
  }

  /**
   * Maximizes the next maximizable field, wrapping back to the first
   */
  @action
  maximizeNextField() {
    const fields = this.getMaximizableFields()
    if (fields.length === 0) {
      return
    }

    const { type, key } = this.maximizedField
    const currentIndex = fields.findIndex((field) => field.type === type && field.key === key)
    const nextField = fields[(currentIndex + 1) % fields.length]

    this.maximizedField = { enabled: true, type: nextField.type, key: nextField.key }
  }

  @action
  setViewMode(viewMode: ViewMode) {
    this.viewMode = viewMode
  }

  // ---------------------------------------------------------------------------
  // Batch mode
  // ---------------------------------------------------------------------------

  get hasBatchMode() {
    return this.getInputFields().some((field) => field.allowBatch)
  }

  /**
   * Turns batch mode on or off, picking the first batch capable input and
   * output fields if none were picked yet
   */
  @action
  setBatchMode(isEnabled: boolean) {
    this.isBatchModeEnabled = isEnabled

    if (this.batchModeInputKey === "") {
      this.batchModeInputKey = this.getInputFields().find((field) => field.allowBatch)?.key ?? ""
    }

    if (this.batchModeOutputKey === "") {
      this.batchModeOutputKey = this.getOutputFields().find((field) => field.allowBatch)?.key ?? ""
    }
  }

  @action
  setBatchModeInputKey(batchInputKey: string) {
    this.batchModeInputKey = batchInputKey
  }

  @action
  setBatchModeOutputKey(batchOutputKey: string) {
    this.batchModeOutputKey = batchOutputKey
  }

  @action
  toggleBatchMode() {
    this.setBatchMode(!this.isBatchModeEnabled)
  }

  // ---------------------------------------------------------------------------
  // Presets
  // ---------------------------------------------------------------------------

  getHasPresets() {
    return this.presets.length > 0
  }

  /**
   * Replaces the input values with a preset's, and runs it
   */
  @action
  fillInputValuesWithPreset(preset: AppletPreset) {
    const { inputValues, optionValues, isBatchModeEnabled = false } = preset
    const presetInputValues = typeof inputValues === "function" ? inputValues() : inputValues

    this.resetInputAndOutputFieldsState()

    if (optionValues) {
      this.optionValues = { ...this.getOptionValuesWithDefault(), ...optionValues }
    }

    this.setBatchMode(isBatchModeEnabled)
    this.setInputValues({ ...this.getInputValuesWithDefault(), ...presetInputValues })

    // An auto run tool runs from the input change, any other tool runs here
    if (!this.autoRun) {
      void this.run()
    }
  }

  // ---------------------------------------------------------------------------
  // Running
  // ---------------------------------------------------------------------------

  /**
   * Runs after the user stops typing, waiting longer when an input is large
   */
  async runDebounced() {
    clearTimeout(this.autoRunTimeout)

    const hasLargeInput = Object.values(this.inputValues).some((value) => isLargeText(value))
    const delay = hasLargeInput
      ? Math.max(this.autoRunDelay, LARGE_INPUT_AUTO_RUN_DELAY)
      : this.autoRunDelay

    this.autoRunTimeout = setTimeout(() => {
      void this.run()
    }, delay)
  }

  /**
   * Runs the tool once the current run finishes, instead of being skipped like
   * `run` is while busy. Used by `peranti.run(values)` from components.
   *
   * Only one run is queued: calls made while one is waiting join it, and their
   * `runValues` are merged into it (the latest call wins per key).
   */
  async runWhenIdle(runValues: Record<string, unknown> = {}) {
    if (this.queuedRun) {
      Object.assign(this.queuedRun.runValues, runValues)
      await this.queuedRun.promise
      return
    }

    const queued = { runValues: { ...runValues }, promise: Promise.resolve() }
    queued.promise = (async() => {
      await when(() => !this.isActionRunning)
      this.queuedRun = undefined
      await this.run(queued.runValues)
    })()

    this.queuedRun = queued
    await queued.promise
  }

  /**
   * Runs the tool, unless it's closed or already running
   *
   * @param runValues Extension tools only: extra values sent with this run,
   * not saved with the tab. See `runWhenIdle`
   */
  async run(runValues?: Record<string, unknown>) {
    if (this.isDeleted || this.isActionRunning) {
      return
    }

    if (this.type === AppletType.Extension) {
      await this.runExtension(runValues)
    } else if (this.type === AppletType.Pipeline) {
      await this.runPipeline()
    } else if (this.isBatchModeEnabled) {
      await this.runBatch()
    } else {
      await this.runNormal()
    }

    if (this.isAutoRunAndFirstTime) {
      this.isAutoRunAndFirstTime = false
    } else {
      this.incrementActionRunCount()
    }
  }

  private async runNormal() {
    const { $errors, ...outputValues } = await this.runAction(this.inputValues, this.optionValues, toJS(this.outputValues))

    this.setFieldErrors($errors ?? {})
    this.setOutputValues(outputValues)
  }

  /**
   * Runs the action once per line of the batch input, and joins each output's
   * results back into lines
   */
  private async runBatch() {
    const { inputValues, batchModeInputKey, optionValues } = this
    const batchInput = inputValues[batchModeInputKey]
    const inputLines = typeof batchInput === "string" ? batchInput.split("\n") : []

    const linesByOutputKey: Record<string, unknown[]> = {}
    for (const inputLine of inputLines) {
      // Field errors can't point at one line of a batch, so they're dropped
      const { $errors: _errors, ...outputValues } = await this.runAction({ ...inputValues, [batchModeInputKey]: inputLine }, optionValues)

      Object.entries(outputValues).forEach(([key, value]) => {
        (linesByOutputKey[key] ??= []).push(value)
      })
    }

    this.setOutputValues(
      Object.fromEntries(
        Object.entries(linesByOutputKey).map(([key, lines]) => [key, lines.join("\n")])
      )
    )
  }

  private async runPipeline() {
    const { nodes = [], edges = [] } = this.inputValues.$PIPELINE ?? {}

    const outputValues = await runPipeline({
      nodes,
      edges,
      pipelineInputValues: this.inputValues,
      runApplet: async(appletId, inputValues) => {
        const applet = new Applet(appletStore.mapOfLoadedApplets[appletId], { disablePersistence: true })
        applet.setInputValuesMerge(inputValues)
        await applet.run()

        return applet.outputValues
      }
    })

    Object.entries(outputValues).forEach(([key, value]) => {
      this.setOutputValue(key, value)
    })
  }

  private async runExtension(runValues: Record<string, unknown> = {}) {
    if (!this.metadata) {
      return
    }

    this.setIsActionRunning(true)

    try {
      const outputValues = await runExtension(this.metadata, { ...toJS(this.inputValues), ...runValues })

      this.dismissRunError()
      this.setOutputValues(outputValues)
    } catch (error) {
      this.showRunError(error)
    } finally {
      this.setIsActionRunning(false)
    }
  }

  /**
   * Calls the tool's action. A failed action returns no outputs, so the
   * previous result is cleared instead of staying on screen
   */
  private async runAction(inputValues: any, optionValues: any, previousOutputValues: any = {}) {
    try {
      let result = this.action({ inputValues, toast, options: optionValues, previousOutputValues })

      // Only async actions are shown as running
      if (typeof result?.then === "function") {
        this.setIsActionRunning(true)
        try {
          result = await result
        } finally {
          this.setIsActionRunning(false)
        }
      }

      this.dismissRunError()
      return result ?? {}
    } catch (error) {
      this.showRunError(error)
      return {}
    }
  }

  /**
   * One error toast per session, replaced on each failed run while the user
   * keeps typing
   */
  private get runErrorToastId() {
    return `applet-error-${this.sessionId}`
  }

  private showRunError(error: unknown) {
    const message = getErrorMessage(error)
    toast.error(`${this.name}: ${message}`, { id: this.runErrorToastId })
  }

  private dismissRunError() {
    toast.dismiss(this.runErrorToastId)
  }

  @action
  private setIsActionRunning(isRunning: boolean) {
    this.isActionRunning = isRunning

    clearTimeout(this.runningIndicatorTimeout)
    this.runningIndicatorTimeout = undefined

    if (isRunning) {
      this.runningIndicatorTimeout = setTimeout(() => {
        this.setIsActionRunningDebounced(true)
      }, RUNNING_INDICATOR_DELAY)
    } else {
      this.setIsActionRunningDebounced(false)
    }
  }

  @action
  private setIsActionRunningDebounced(isRunning: boolean) {
    this.isActionRunningDebounced = isRunning
    sessionStore.setSessionHasRunningAction(this.sessionId, isRunning)
  }

  @action
  private incrementActionRunCount() {
    this.actionRunCount += 1
  }
}
