import fastDeepEqual from "fast-deep-equal"
import { observable, action, makeObservable, toJS } from "mobx"
import { PersistStoreMap, hydrateStore, isPersisting, makePersistable, stopPersisting } from "mobx-persist-store"
import toast from "react-hot-toast"
import { type Edge, type Node } from "reactflow"
import { merge } from "ts-deepmerge"

import { StorageKeys } from "src/constants/storage-keys"
import { AppletType } from "src/enums/applet-type"
import { appletComponentService } from "src/services/applet-component-service"
import { appletStore } from "src/services/applet-store"
import { rustInvokerService } from "src/services/rust-invoker-service"
import { sessionStore } from "src/services/session-store"
import { StorageManager } from "src/services/storage-manager"
import { type AppletActionParams } from "src/types/AppletAction"
import { type AppletInput } from "src/types/AppletInput"
import { type AppletOption } from "src/types/AppletOption"
import { type AppletOutput } from "src/types/AppletOutput"
import { type AppletSample } from "src/types/AppletSample"
import { type AppletState } from "src/types/AppletState"
import { type ExtensionMetadata } from "src/types/ExtensionMetadata"
import { type LayoutSetting } from "src/types/LayoutSetting"
import { type Session } from "src/types/Session"
import { type SessionHistory } from "src/types/SessionHistory"
import { generateRandomString } from "src/utils/generate-random-string"

import { type AppletConstructor } from "./AppletConstructor.js"

/**
 * Applet, a small program that performs a specific task.
 */
export class Applet<
  InputFields extends Record<string, any> = any,
  OutputFields extends Record<string, any> = any,
  OptionKeys extends Record<string, any> = any
> {
  /**
   * Unique ID of applet
   */
  readonly appletId: string

  /**
   * Type of applet
   */
  readonly type: AppletType

  /**
   * Applet name
   */
  readonly name: string

  /**
   * Applet description
   */
  readonly description: string = ""

  /**
   * Applet category
   */
  readonly category: string

  /**
   * Applet input and output layout settings
   */
  readonly layoutSetting: LayoutSetting

  /**
   * Allow applet to run its pipeline
   */
  private readonly canRunPipeline = true

  /**
   * Unique ID of each created session based on this applet
   */
  readonly sessionId: string

  /**
   * Custom session name for created applet session
   */
  sessionName?: string

  /**
   * Sequence number of every applet session has been created
   */
  sessionSequenceNumber?: number

  /**
   * Input fields for applet
   */
  readonly inputFields: Array<AppletInput<InputFields>> | ((inputValues: any) => Array<AppletInput<InputFields>>)

  /**
   * Component's state of input fields (scroll position, text selection, zoom, etc)
   */
  @observable inputFieldsState: any = {}

  /**
   * Key value pair of input keys and its values
   */
  @observable inputValues: any = {}

  /**
   * Indicates input values has been changed
   */
  isInputValuesModified: boolean = false

  /**
   * Output fields for applet
   */
  readonly outputFields: Array<AppletOutput<OutputFields>> | ((outputValues: any) => Array<AppletOutput<OutputFields>>)

  /**
   * Component's state of output fields (scroll position, text selection, zoom, etc)
   */
  @observable outputFieldsState: Record<string, any> = {}

  /**
   * Key value pair of output keys and its values
   */
  @observable outputValues: any = {}

  /**
   * Indicates output values has been changed
   */
  isOutputValuesModified: boolean = false

  /**
   * Auto execute applet action when input values is changed
   */
  readonly autoRun: boolean = false

  /**
   * Debounce input delay when autoRun is enabled
   */
  autoRunDelay: number = 0

  /**
   * Variable to store setTimeout when running action
   */
  private autoRunSetTimeout?: NodeJS.Timeout

  /**
   * Indicates that the applet has auto run enabled and hasn't been run
   * for at least once
   */
  isAutoRunAndFirstTime: boolean = false

  /**
   * Applet action
   */
  readonly action: (actionParams: AppletActionParams<InputFields, OutputFields>) => any

  /**
   * Running count for action
   */
  @observable actionRunCount: number = 0

  /**
   * Is action still running asynchronous
   */
  @observable isActionRunning: boolean = false

  /**
   * Is action still running asynchronous more than 500 milliseconds
   * Used to show on user interface
   */
  @observable isActionRunningDebounced: boolean = false

  /**
   * Variable to store the setTimeout number for debounced value
   */
  private isActionRunningDebouncedTimeout?: NodeJS.Timeout

  /**
   * Input field key when batch mode enabled
   */
  @observable batchModeInputKey: string = ""

  /**
   * Output fields key when batch mode enabled
   */
  @observable batchModeOutputKey: string = ""

  /**
   * Indicates batch mode is enabled
   */
  @observable isBatchModeEnabled: boolean = false

  /**
   * Indicates the session has been deleted
   */
  @observable isDeleted: boolean = false

  /**
   * Key to store applet session state into storage
   */
  readonly state?: AppletState = undefined

  /**
   * Disable persistence for applet session
   */
  readonly disablePersistence: boolean = false

  /**
   * Disable creating session more than once for the applet
   */
  readonly disableMultipleSession: boolean = false

  /**
   * Metadata used for other type of applet
   */
  readonly metadata?: ExtensionMetadata

  /**
   * Applet input samples
   */
  readonly samples: Array<AppletSample<InputFields>> = []

  /**
   * Applet input and output options
   */
  readonly options: Array<AppletOption<OptionKeys>>

  /**
   * Applet options values
   */
  @observable optionValues: any = {}

  /**
   * Indicates that the applet has input values overridden by preset
   */
  readonly hasOverriddenDefaultState: boolean = false

  @observable viewMode: "main" | "pipeline"

  @observable maximizedField = {
    enabled: false,
    type: "",
    key: ""
  }

  @action
  toggleMaximizedFieldKey(options: typeof this.maximizedField) {
    if (this.maximizedField.enabled === options.enabled &&
      this.maximizedField.key === options.key &&
      this.maximizedField.type === options.type) {
      options.enabled = false
    }

    this.maximizedField = options
  }

  /**
   * Empty applet
   *
   * @returns
   */
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

  /**
   * Constructor
   *
   * @param appletConstructor
   * @param options
   */
  constructor(
    appletConstructor: AppletConstructor<InputFields, OutputFields>,
    options: {
      initialState?: Partial<AppletState>
      disablePersistence?: boolean
    } = {}
  ) {
    this.appletId = appletConstructor.appletId
    this.sessionId = appletConstructor.appletId === ""
      ? ""
      : this.appletId.concat(generateRandomString(10, "1234567890qwertyuiopasdfghjklzxcvbnm"))
    this.name = appletConstructor.name
    this.action = appletConstructor.action ?? (() => ({}))
    this.category = appletConstructor.category
    this.inputFields = appletConstructor.inputFields
    this.outputFields = appletConstructor.outputFields
    this.autoRun = appletConstructor.autoRun ?? true
    this.type = appletConstructor.type ?? AppletType.Tool
    this.metadata = appletConstructor.metadata
    this.samples = appletConstructor.samples ?? []
    this.disableMultipleSession = appletConstructor.disableMultipleSession ?? !sessionStore.enableMultipleSession
    this.hasOverriddenDefaultState = appletConstructor.hasOverriddenDefaultState ?? false
    this.inputValues = this.getInputValuesWithDefault()
    this.options = appletConstructor.options ?? []
    this.optionValues = this.getOptionValuesWithDefault()
    this.description = appletConstructor.description ?? ""
    this.viewMode = "main"

    /**
     * Set default viewMode when opening pipeline for the first time
     */
    if (appletConstructor.type === AppletType.Pipeline) {
      this.viewMode = "pipeline"
      this.autoRun = false
    }

    /**
     * Default true when autoRun is enabled
     */
    if (this.autoRun) {
      this.isAutoRunAndFirstTime = true
    }

    /**
     * Default layout for applet
     */
    this.layoutSetting = {
      /**
       * Default area type is horizontal, input and output area are side-by-side
       */
      areaType: "flex",
      areaFlexDirection: "horizontal",

      /**
       * Default fields placement are vertically stacked from top to bottom
       */
      fieldsType: "flex",
      fieldsInputFlexDirection: "vertical",
      fieldsOutputFlexDirection: "vertical",

      ...appletConstructor.layoutSetting ?? {}
    }

    /**
     * Replace constructed state with initialState if exist
     */
    const { initialState } = options
    if (initialState) {
      this.sessionId = initialState.sessionId ?? this.sessionId
      this.sessionName = initialState.sessionName ?? this.sessionName
      this.sessionSequenceNumber = initialState.sessionSequenceNumber ?? this.sessionSequenceNumber
      this.inputValues = Object.assign(this.inputValues, initialState.inputValues)
      this.outputValues = Object.assign(this.outputValues, initialState.outputValues)
      this.isBatchModeEnabled = initialState.isBatchModeEnabled ?? this.isBatchModeEnabled
      this.batchModeInputKey = initialState.batchModeInputKey ?? this.batchModeInputKey
      this.batchModeOutputKey = initialState.batchModeOutputKey ?? this.batchModeOutputKey
      this.actionRunCount = initialState.actionRunCount ?? this.actionRunCount
      this.isOutputValuesModified = initialState.isOutputValuesModified ?? this.isOutputValuesModified
      this.isInputValuesModified = initialState.isInputValuesModified ?? this.isInputValuesModified
      this.isDeleted = initialState.isDeleted ?? this.isDeleted
      this.inputFieldsState = initialState.inputFieldsState ?? this.inputFieldsState
      this.outputFieldsState = initialState.outputFieldsState ?? this.outputFieldsState
      this.isAutoRunAndFirstTime = initialState.isAutoRunAndFirstTime ?? this.isAutoRunAndFirstTime
      this.optionValues = initialState.optionValues ?? this.optionValues
      this.viewMode = initialState.viewMode ?? this.viewMode
      this.maximizedField = initialState.maximizedField ?? this.maximizedField
    }

    /**
     * Use applet name as sessionName if the applet only allowed
     * to have one session at once
     */
    if (this.disableMultipleSession && this.appletId !== "") {
      this.sessionName = appletStore.mapOfLoadedApplets[this.appletId].name
    }

    /**
     * Disable persistence if needed
     */
    const { disablePersistence = false } = options
    this.disablePersistence = disablePersistence

    makeObservable(this)
    this.setupPersistence()
  }

  private setupPersistence() {
    Array.from(PersistStoreMap.keys()).forEach((sessionKey) => {
      if (sessionKey?.sessionId === this.sessionId) {
        PersistStoreMap.delete(sessionKey)
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
            serialize: () => {
              return this.toState()
            },
            deserialize: () => {
              return this.state
            }
          }
        ]
      },
      {
        delay: 100
      }
    )
  }

  toState(): AppletState {
    const {
      batchModeInputKey,
      batchModeOutputKey,
      inputFieldsState,
      inputValues,
      isBatchModeEnabled,
      isDeleted,
      isInputValuesModified,
      isOutputValuesModified,
      outputFieldsState,
      outputValues,
      actionRunCount,
      sessionId,
      sessionName,
      sessionSequenceNumber,
      appletId,
      isAutoRunAndFirstTime,
      optionValues,
      viewMode,
      maximizedField
    } = this

    const createdAt = new Date().getTime()

    return {
      batchModeInputKey,
      batchModeOutputKey,
      createdAt,
      inputFieldsState: toJS(inputFieldsState),
      inputValues: toJS(inputValues),
      isBatchModeEnabled,
      isDeleted,
      isInputValuesModified,
      isOutputValuesModified,
      outputFieldsState: toJS(outputFieldsState),
      outputValues: toJS(outputValues),
      actionRunCount,
      sessionId,
      sessionName,
      sessionSequenceNumber,
      appletId,
      isAutoRunAndFirstTime,
      optionValues: toJS(optionValues),
      viewMode,
      maximizedField: toJS(maximizedField)
    }
  }

  toSession(): Session {
    const { sessionId, sessionName, sessionSequenceNumber, appletId } = this

    return { sessionId, sessionName, sessionSequenceNumber, appletId }
  }

  toHistory(): SessionHistory {
    const { sessionId, sessionName, appletId } = this
    const deletedAt = new Date().getTime()

    return { deletedAt, sessionId, sessionName, appletId }
  }

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

  get hasBatchMode() {
    return this.getInputFields().some((output) => output.allowBatch)
  }

  @action
  setBatchMode(isEnabled: boolean) {
    this.isBatchModeEnabled = isEnabled

    if (this.batchModeInputKey === "") {
      const batchInputField = this.getInputFields().filter((input) => input.allowBatch)[0]
      if (batchInputField) {
        this.batchModeInputKey = batchInputField.key
      }
    }

    if (this.batchModeOutputKey === "") {
      const batchOutputField = this.getOutputFields().filter((output) => output.allowBatch)[0]
      if (batchOutputField) {
        this.batchModeOutputKey = batchOutputField.key
      }
    }
  }

  @action
  setBatchModeOutputKey(batchOutputKey: string) {
    this.batchModeOutputKey = batchOutputKey
  }

  @action
  setBatchModeInputKey(batchInputKey: string) {
    this.batchModeInputKey = batchInputKey
  }

  @action
  toggleBatchMode() {
    this.setBatchMode(!this.isBatchModeEnabled)
  }

  getInputFields() {
    if (this.type === AppletType.Pipeline && this.viewMode === "main") {
      return this.getInputFieldsFromPipeline()
    }

    if (typeof this.inputFields === "function") {
      return this.inputFields(this.inputValues)
    }
    return this.inputFields
  }

  private getInputFieldsFromPipeline() {
    const inputNodes: Node[] = this.inputValues?.$PIPELINE?.nodes ?? []

    if (inputNodes.length > 0) {
      const appletInputNodes = inputNodes.filter((inputNode) => inputNode.type === "appletInput")
      const appletInput: Array<AppletInput<InputFields>> = appletInputNodes.map((inputNode) => ({
        key: inputNode.data.key,
        label: inputNode.data.label,
        component: inputNode.data.component
      }))

      return appletInput
    }

    return []
  }

  getInputFieldsWithReadableFile(): [Array<AppletInput<InputFields>>, boolean] {
    const inputFields = this.getInputFields()

    let hasAllowBatch = false
    const filteredInputFields = inputFields.filter((inputField) => {
      if (inputField.allowBatch) {
        hasAllowBatch = true
      }

      const inputToCompare = appletComponentService.getInputComponent(inputField.component)
      return !!inputToCompare.readFileAs
    })

    if (filteredInputFields.length > 0) {
      return [filteredInputFields, false]
    }

    if (!hasAllowBatch) {
      return [[], hasAllowBatch]
    }

    const filteredBatchInputFields = inputFields.filter((inputField) => {
      const inputToCompare = appletComponentService.getInputComponent(inputField.component, true)

      return !!inputToCompare.readFileAs
    })

    return [filteredBatchInputFields, true]
  }

  getOutputFields() {
    if (this.type === AppletType.Pipeline && this.viewMode === "main") {
      return this.getOutputFieldsFromPipeline()
    }

    if (typeof this.outputFields === "function") {
      return this.outputFields(this.inputValues)
    }
    return this.outputFields
  }

  private getOutputFieldsFromPipeline() {
    const outputNodes: Node[] = this.inputValues?.$PIPELINE?.nodes ?? []

    if (outputNodes.length > 0) {
      const appletOutputNodes = outputNodes.filter((inputNode) => inputNode.type === "appletOutput")
      const appletOutput: Array<AppletOutput<InputFields>> = appletOutputNodes.map((outputNode) => ({
        key: outputNode.data.key,
        label: outputNode.data.label,
        component: outputNode.data.component
      }))

      return appletOutput
    }

    return []
  }

  @action
  setInputValue(key: string, value: unknown, options: { markAsModified: boolean } = { markAsModified: true }) {
    const newInputValues = { ...this.inputValues, [key]: value }

    const inputValuesHasChanged = value instanceof File
      ? true
      : !fastDeepEqual(this.inputValues, newInputValues)

    if (inputValuesHasChanged) {
      this.inputValues = { ...this.inputValues, [key]: value }
    }

    if (!this.isAutoRunAndFirstTime) {
      this.isInputValuesModified = options.markAsModified
    }
  }

  @action
  setInputValues(inputValues: any, options: { markAsModified: boolean } = { markAsModified: true }) {
    this.inputValues = inputValues

    if (!this.isAutoRunAndFirstTime) {
      this.isInputValuesModified = options.markAsModified
    }
  }

  @action
  setInputValuesMerge(inputValues: any, options: { markAsModified: boolean } = { markAsModified: true }) {
    const mergedValues = merge(this.inputValues, inputValues)
    this.setInputValues(mergedValues, options)
  }

  getInputValue(key: string) {
    return this.inputValues[key]
  }

  @action
  setOutputValue(key: string, value: unknown, options: { markAsModified: boolean } = { markAsModified: true }) {
    this.outputValues = { ...this.outputValues, [key]: value }

    if (!this.isAutoRunAndFirstTime) {
      this.isOutputValuesModified = options.markAsModified
    }
  }

  @action
  setOutputValues(outputValues: any, options: { markAsModified: boolean } = { markAsModified: true }) {
    this.outputValues = outputValues

    if (!this.isAutoRunAndFirstTime) {
      this.isOutputValuesModified = options.markAsModified
    }
  }

  getOutputValue(key: string) {
    return this.outputValues[key]
  }

  /**
   * Set option value and re-run applet action if possible
   *
   * @param key
   * @param value
   */
  @action
  setOptionValue(key: string, value: unknown) {
    this.optionValues = { ...this.optionValues, [key]: value }

    /**
     * Re-run action if input has been modified and autoRun is enabled
     */
    if (this.autoRun && this.isInputValuesModified) {
      void this.run()
    }
  }

  @action
  resetInputAndOutputValues() {
    this.inputValues = this.getInputValuesWithDefault()
    this.outputValues = {}
  }

  getInputValuesWithDefault() {
    return Object.fromEntries(this.getInputFields().map((i) => [i.key, i.defaultValue]))
  }

  getOptionValuesWithDefault() {
    return Object.fromEntries(this.options.map((i) => [i.key, i.defaultValue]))
  }

  getIsInputOrOutputHasValues(): boolean {
    const inputFields = this.getInputFields()
    const hasInputValues = Object.entries(this.inputValues).filter(
      ([key, value]) => Boolean(value) && !inputFields.find((field) => field.key === key)?.skipValidateHasValue
    ).length > 0

    const hasOutputValues = Object.values(this.outputValues).filter(
      (value) => Boolean(value)
    ).length > 0

    return hasInputValues || hasOutputValues
  }

  @action
  setInputFieldState(key: string, state: unknown) {
    if (this.isDeleted) {
      return
    }

    this.inputFieldsState = { ...this.inputFieldsState, [key]: state }
  }

  @action
  setOutputFieldState(key: string, state: unknown) {
    if (this.isDeleted) {
      return
    }

    this.outputFieldsState = { ...this.outputFieldsState, [key]: state }
  }

  @action
  resetInputAndOutputFieldsState() {
    this.inputFieldsState = {}
    this.outputFieldsState = {}
  }

  /**
   * Mark applet has action running
   *
   * @param newActionValue
   */
  @action
  private setIsActionRunning(newActionValue: boolean) {
    this.isActionRunning = newActionValue

    /**
     * Clear existing debounced setTimeout
     */
    if (this.isActionRunningDebouncedTimeout) {
      clearTimeout(this.isActionRunningDebouncedTimeout)
      this.isActionRunningDebouncedTimeout = undefined
    }

    /**
     * If isActionRunning has value true, wait few milliseconds to set value of
     * session store and debounced value
     */
    if (newActionValue) {
      this.isActionRunningDebouncedTimeout = setTimeout(() => {
        this.isActionRunningDebounced = newActionValue
        sessionStore.setSessionHasRunningAction(this.sessionId, newActionValue)
      }, 200)
    } else {
      this.isActionRunningDebounced = newActionValue
      sessionStore.setSessionHasRunningAction(this.sessionId, newActionValue)
    }
  }

  @action
  private incrementActionRunCount() {
    this.actionRunCount = this.actionRunCount + 1
  }

  async runDebounced() {
    if (this.autoRunSetTimeout) {
      clearTimeout(this.autoRunSetTimeout)
    }

    this.autoRunSetTimeout = setTimeout(() => {
      void this.run()
    }, this.autoRunDelay)
  }

  async run() {
    if (this.isDeleted || this.isActionRunning) {
      return
    }

    if (this.type === AppletType.Extension) {
      await this.runExtension()
    } else if (this.canRunPipeline && this.type === AppletType.Pipeline) {
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

  private async runAction(actionInput: any, actionOptions: any) {
    const runResult = await new Promise<any>((resolve) => {
      const actionParams = { inputValues: actionInput, toast, options: actionOptions }
      const result = this.action(actionParams)

      if ("then" in result) {
        this.setIsActionRunning(true)
        result
          .then((data: any) => {
            this.setIsActionRunning(false)
            resolve(data)
          })
          .catch(() => {
            this.setIsActionRunning(false)
            resolve(undefined)
          })
      }

      resolve(result)
    })

    return runResult
  }

  private async runExtension() {
    if (this.metadata) {
      this.setIsActionRunning(true)

      const { actionFile, dependencies } = this.metadata

      try {
        const extensionResult = await rustInvokerService.runExtension({
          builtin: dependencies.builtin,
          external: dependencies.external,
          file: actionFile,
          input: this.inputValues
        })

        this.setOutputValues(extensionResult)
      } catch (exception) {
        console.log(exception)
        toast.error(`Failed to run ${this.name} extension`)
      }

      this.setIsActionRunning(false)
    }
  }

  private async runNormal() {
    const runResult = await this.runAction(this.inputValues, this.optionValues)
    this.setOutputValues(runResult)
  }

  private async runPipeline() {
    console.log(this.sessionId, "Run pipeline")

    const edges: Edge[] = this.inputValues.$PIPELINE.edges ?? []
    const nodes: Node[] = this.inputValues.$PIPELINE.nodes ?? []
    const nodesMap = Object.fromEntries(nodes.map((node) => [node.id, node]))

    const resolvedValues: Record<string, Record<any, any>> = {}

    const targetInputDependencies: Record<string, number> = {}
    edges.forEach((edge) => {
      if (!targetInputDependencies[edge.target]) {
        targetInputDependencies[edge.target] = 0
      }
      targetInputDependencies[edge.target]++
    })

    let breakWhile = false

    /**
     * Resolve node outputValues that has no input dependencies
     */
    let resolveTargetWithoutDependencies = true

    /**
     * Find unresolved edge by filtering the source edge that has value and does not
     * resolving the target value
     */
    let unresolved = edges.filter((edge) => !targetInputDependencies[edge.source] && !resolvedValues[edge.source])

    const countExecutedEdges: Record<string, number> = {}

    console.log(this.sessionId, "Nodes", toJS(edges))
    console.log(this.sessionId, "Edges", toJS(nodes))

    while (unresolved.length > 0 && !breakWhile) {
      const edge = unresolved[0]
      const node = nodesMap[edge.source]

      /**
       * Count number of time(s) edge has been executed
       */
      if (!countExecutedEdges[edge.id]) {
        countExecutedEdges[edge.id] = 0
      }
      countExecutedEdges[edge.id]++

      /**
       * Break while loop if edge is executed more than 1 times
       * It's supposed to run once
       */
      if (countExecutedEdges[edge.id] > 1) {
        breakWhile = true
      }

      /**
       * Set default value for source node
       */
      if (!resolvedValues[edge.source]) {
        resolvedValues[edge.source] = { inputValues: {}, outputValues: {} }
      }

      /**
       * Set default value for target node
       */
      if (!resolvedValues[edge.target]) {
        resolvedValues[edge.target] = { inputValues: {}, outputValues: {} }
      }

      /**
       * Fill source node input and output values
       */
      if (node.type === "applet") {
        const appletConstructor = appletStore.mapOfLoadedApplets[node.data.appletId]
        const applet = new Applet(appletConstructor, { disablePersistence: true })
        applet.setInputValuesMerge(resolvedValues[edge.source].inputValues)
        await applet.run()

        console.log(this.sessionId, "Run node", applet.name, "with result", applet.outputValues)

        resolvedValues[edge.source].outputValues = merge(
          resolvedValues[edge.source].outputValues,
          applet.outputValues
        )
      } else if (node.type === "appletInput") {
        if (edge.sourceHandle && edge.targetHandle) {
          resolvedValues[edge.source].outputValues[edge.sourceHandle] = this.inputValues[node.data.key]
        }
      }

      /**
       * Fill target node input and output values
       */
      const sourceEdges = edges.filter((e) => e.source === edge.source)

      sourceEdges.forEach((sourceEdge) => {
        console.log(this.sessionId, "Resolving edge", edge.source, "for", sourceEdge.target)
        if (sourceEdge.targetHandle && sourceEdge.sourceHandle) {
          const targetInputValues = {
            [sourceEdge.targetHandle]: resolvedValues[edge.source].outputValues[sourceEdge.sourceHandle]
          }

          /**
           * Set default value for target node
           */
          if (!resolvedValues[sourceEdge.target]) {
            resolvedValues[sourceEdge.target] = { inputValues: {}, outputValues: {} }
          }

          resolvedValues[sourceEdge.target].inputValues = merge(
            resolvedValues[sourceEdge.target].inputValues,
            targetInputValues
          )
        }
      })

      if (resolveTargetWithoutDependencies) {
        unresolved = edges.filter((edge) => !targetInputDependencies[edge.source] && !resolvedValues[edge.source])
      }

      if (unresolved.length === 0 || !resolveTargetWithoutDependencies) {
        resolveTargetWithoutDependencies = false
        unresolved = edges.filter((edge) => (
          (targetInputDependencies[edge.source] === Object.values(resolvedValues?.[edge.source]?.inputValues ?? {}).length) &&
          Object.values(resolvedValues[edge.source]?.outputValues ?? {}).length === 0
        ))
      }

      console.log(this.sessionId, "Resolved values", resolvedValues)
    }

    console.log(this.sessionId, "Final resolved values", resolvedValues)
    console.log(this.sessionId, "Time(s) edge executed", countExecutedEdges)

    const outputNodes = nodes.filter((node) => node.type === "appletOutput" && resolvedValues[node.id]?.inputValues)
    outputNodes.forEach((outputNode) => {
      this.setOutputValue(outputNode.data.key, resolvedValues[outputNode.id].inputValues[outputNode.data.key])
    })
  }

  private async runBatch() {
    const { inputValues, batchModeInputKey: batchInputKey, optionValues } = this
    const batchInputValues = inputValues[batchInputKey]
    const inputLines = batchInputValues.split("\n")

    const outputs = []
    for (const inputLine of inputLines) {
      const runResult = await this.runAction({ ...inputValues, [batchInputKey]: inputLine }, optionValues)
      outputs.push(runResult)
    }

    const listOfOutputParams: Record<string, string[]> = outputs.reduce((sum, a) => {
      Object.entries(a).forEach(([key, value]) => {
        if (!sum[key]) sum[key] = []
        sum[key].push(value)
      })

      return sum
    }, {})

    this.setOutputValues(
      Object.fromEntries(
        Object.entries(listOfOutputParams).map(([key, value]) => [key, value.join("\n")])
      )
    )
  }

  /**
   * Manually hydrate applet state to storage
   */
  async hydrateStore() {
    await hydrateStore(this)
  }

  /**
   * Stop and destroy reference to mobx persist store
   */
  stopStore() {
    stopPersisting(this)
  }

  /**
   * Set value of isDeleted
   *
   * @param isDeleted
   */
  @action
  setDeleted(isDeleted: boolean) {
    this.isDeleted = isDeleted
  }

  /**
   * Mark applet as deleted
   */
  @action
  async markAsDeleted() {
    this.setDeleted(true)

    /**
     * Reset input and output field state
     */
    this.resetInputAndOutputFieldsState()

    /**
     * Reset to pipeline mode when deleted applet type is Pipeline
     */
    if (this.type === AppletType.Pipeline) {
      this.viewMode = "pipeline"
    }

    /**
     * Direcly update to storage if the applet session if not persisting
     *
     * Example case for this one is when the tab are not currently active and
     * closed through tabbar context menu (Close Tab, Close Others or Close All)
     */
    if (!isPersisting(this)) {
      await StorageManager.updateAppletStatePropertyInStorage(this.sessionId, {
        inputFieldsState: {},
        outputFieldsState: {},
        isDeleted: true,
        viewMode: this.type === AppletType.Pipeline ? "pipeline" : this.viewMode
      })
    }
  }

  /**
   * Indicates applet has samples
   *
   * @returns
   */
  getHasSamples() {
    return this.samples.length > 0
  }

  /**
   * Fill current inputValues with sample data
   *
   * @param sample
   */
  fillInputValuesWithSample(sample: AppletSample) {
    if (sample) {
      const defaultInputValues = this.getInputValuesWithDefault()
      const { inputValues, isBatchModeEnabled = false } = sample

      this.resetInputAndOutputFieldsState()

      this.setBatchMode(isBatchModeEnabled)
      let computedInputValues
      if (typeof inputValues === "function") {
        computedInputValues = inputValues()
      } else {
        computedInputValues = inputValues
      }

      this.setInputValues({ ...defaultInputValues, ...computedInputValues })

      /**
       * Always run the sample even the applet has autoRun disabled
       */
      if (!this.autoRun) {
        void this.run()
      }
    }
  }

  @action
  setViewMode(viewMode: "main" | "pipeline") {
    this.viewMode = viewMode
  }
}
