import fastDeepEqual from "fast-deep-equal"
import { observable, action, makeObservable, toJS } from "mobx"
import { PersistStoreMap, hydrateStore, isPersisting, makePersistable, pausePersisting, startPersisting, stopPersisting } from "mobx-persist-store"
import toast from "react-hot-toast"

import { StorageKeys } from "src/constants/storage-keys"
import { AppletType } from "src/enums/applet-type"
import { appletComponentService } from "src/services/applet-component-service"
import { appletStore } from "src/services/applet-store"
import { rustInvokerService } from "src/services/rust-invoker-service"
import { sessionStore } from "src/services/session-store"
import { StorageManager } from "src/services/storage-manager"
import { type AppletActionParams } from "src/types/AppletAction"
import { type AppletConstructor } from "src/types/AppletConstructor"
import { type AppletInput } from "src/types/AppletInput"
import { type AppletOption } from "src/types/AppletOption"
import { type AppletOutput } from "src/types/AppletOutput"
import { type AppletSample } from "src/types/AppletSample"
import { type AppletState } from "src/types/AppletState"
import { type ExtensionMetadata } from "src/types/ExtensionMetadata"
import { type LayoutSetting } from "src/types/LayoutSetting"
import { type Pipeline } from "src/types/Pipeline"
import { type Session } from "src/types/Session"
import { type SessionHistory } from "src/types/SessionHistory"
import { generateRandomString } from "src/utils/generate-random-string"

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
   * Auto execute applet action when input values is changed
   */
  readonly autoRun: boolean = false

  /**
   * Indicates that the applet has auto run enabled and hasn't been run
   * for at least once
   */
  isAutoRunAndFirstTime: boolean = false

  /**
   * Pipelines of applet
   */
  readonly pipelines: Pipeline[] = []

  /**
   * Allow applet to run its pipeline
   */
  private canRunPipeline = true

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
   * Counter to force rerender applet viewer
   */
  @observable renderCounter: number = 0

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
   * Index of sample that has been showed on viewer
   */
  @observable sampleIndex: number = 0

  /**
   * Applet input and output options
   */
  readonly options: Array<AppletOption<OptionKeys>>

  @observable optionValues: any = {}

  /**
   * Indicates that the applet has input values overridden by preset
   */
  readonly hasOverriddenDefaultState: boolean = false

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
    this.pipelines = appletConstructor.pipelines ?? []
    this.autoRun = appletConstructor.autoRun ?? true
    this.type = appletConstructor.type ?? AppletType.Tool
    this.metadata = appletConstructor.metadata
    this.samples = appletConstructor.samples ?? []
    this.disableMultipleSession = appletConstructor.disableMultipleSession ?? false
    this.hasOverriddenDefaultState = appletConstructor.hasOverriddenDefaultState ?? false
    this.inputValues = this.getInputValuesWithDefault()
    this.options = appletConstructor.options ?? []
    this.optionValues = this.getOptionValuesWithDefault()
    this.description = appletConstructor.description ?? ""

    if (this.autoRun) {
      this.isAutoRunAndFirstTime = true
    }

    this.layoutSetting = {
      direction: "horizontal",
      reversed: false,
      gridTemplate: "1fr 1fr",
      inputAreaDirection: "vertical",
      outputAreaDirection: "vertical",
      ...appletConstructor.layoutSetting
    }

    const { initialState, disablePersistence = false } = options
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
    }

    if (this.disableMultipleSession) {
      this.sessionName = appletStore.mapOfLoadedApplets[this.appletId].name
    }

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
      optionValues
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
      optionValues: toJS(optionValues)
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
    if (typeof this.inputFields === "function") {
      return this.inputFields(this.inputValues)
    }
    return this.inputFields
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
    if (typeof this.outputFields === "function") {
      return this.outputFields(this.inputValues)
    }
    return this.outputFields
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
     * Re-run action if input has been modified
     */
    if (this.isInputValuesModified) {
      void this.run()
    }
  }

  @action
  setOptionValues(optionValues: any) {
    this.optionValues = optionValues
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

  @action
  private setIsActionRunning(value: boolean) {
    this.isActionRunning = value
    sessionStore.keepAliveSession(this.sessionId, value)
  }

  @action
  private incrementActionRunCount() {
    this.actionRunCount = this.actionRunCount + 1
  }

  async run() {
    if (this.isDeleted || this.isActionRunning) {
      return
    }

    if (this.type === AppletType.Extension) {
      void this.runExtension()
    } else if (this.canRunPipeline && this.pipelines.length > 0) {
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
    const { pipelines = [] } = this
    const pipelineResults = []
    const mergedPipelines = [this, ...pipelines, this]

    for (let index = 0; index < mergedPipelines.length; index++) {
      const pipeline = mergedPipelines[index]

      if (index === 0) {
        pipelineResults.push((pipeline as this).inputValues)
      } else if (index === mergedPipelines.length - 1) {
        this.setOutputValues(pipelineResults[index - 1])
      } else {
        const appletConstructor = appletStore.mapOfLoadedApplets[pipeline.appletId]
        const applet = new Applet(appletConstructor)
        applet.canRunPipeline = false

        const previousResult = pipelineResults[index - 1];
        (pipeline as Pipeline).fields.forEach((field: any) => {
          if (field.previousOutputKey) {
            applet.setInputValue(field.inputKey, previousResult[field.previousOutputKey])
          } else if (field.value) {
            applet.setInputValue(field.inputKey, field.value)
          }
        })

        await applet.run()
        pipelineResults.push(applet.outputValues)
      }
    }
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

  @action
  forceRerender() {
    this.renderCounter += 1
  }

  getHasIframe() {
    return this.getOutputFields().some((field) => field.component === "IFrame")
  }

  async hydrateStore() {
    await hydrateStore(this)
  }

  pauseStore() {
    pausePersisting(this)
  }

  startStore() {
    startPersisting(this)
  }

  stopStore() {
    stopPersisting(this)
  }

  @action
  setDeleted(isDeleted: boolean) {
    this.isDeleted = isDeleted
  }

  @action
  async markAsDeleted() {
    this.resetInputAndOutputFieldsState()
    this.setDeleted(true)

    if (!isPersisting(this)) {
      await StorageManager.updateAppletStatePropertyInStorage(this.sessionId, {
        inputFieldsState: {},
        outputFieldsState: {},
        isDeleted: true
      })
    }
  }

  @action
  setSampleIndex(index: number) {
    this.sampleIndex = index
  }

  getHasSamples() {
    return this.samples.length > 0
  }

  fillInputValuesWithSample(sample: AppletSample) {
    if (sample) {
      const defaultInputValues = this.getInputValuesWithDefault()
      const { inputValues, isBatchModeEnabled = false } = sample

      this.setBatchMode(isBatchModeEnabled)
      if (typeof inputValues === "function") {
        this.setInputValues({ ...defaultInputValues, ...inputValues() })
      } else {
        this.setInputValues({ ...defaultInputValues, ...inputValues })
      }

      this.forceRerender()

      if (!this.autoRun) {
        void this.run()
      }
    }
  }
}
