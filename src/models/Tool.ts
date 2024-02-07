import { Command } from "@tauri-apps/api/shell"
import fastDeepEqual from "fast-deep-equal"
// import mimeMatch from "mime-match"
import { observable, action, makeObservable, toJS } from "mobx"
import { PersistStoreMap, hydrateStore, isPersisting, makePersistable, pausePersisting, startPersisting, stopPersisting } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"
import { ToolType } from "src/enums/ToolType"
import { toolComponentService } from "src/services/toolComponentService"
import { ToolStorageManager } from "src/services/toolStorageManager"
import { toolSessionStore } from "src/stores/toolSessionStore"
import { toolStore } from "src/stores/toolStore"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolExtensionMetadata } from "src/types/ToolExtensionMetadata"
import { type ToolHistory } from "src/types/ToolHistory"
import { type ToolInput } from "src/types/ToolInput"
import { type ToolLayoutSetting } from "src/types/ToolLayoutSetting"
import { type ToolOutput } from "src/types/ToolOutput"
import { type ToolPreset } from "src/types/ToolPreset"
import { type ToolSession } from "src/types/ToolSession"
import { type ToolState } from "src/types/ToolState"
import { generateRandomString } from "src/utils/generateRandomString"

export class Tool<IF extends Record<string, any> = any, OF extends Record<string, any> = any> {
  /**
   * Tool ID
   */
  readonly toolId: string

  /**
   * Type of tool
   */
  readonly type: ToolType

  /**
   * Name of tool
   */
  readonly name: string

  /**
   * Category of tool
   */
  readonly category: string

  /**
   * Unique ID of created session
   */
  readonly sessionId: string

  /***
   * Tool layout setting
   */
  readonly layoutSetting: ToolLayoutSetting

  /**
   * Should tools is auto run when user made changes on inputs, default is true
   */
  readonly autoRun: boolean = false

  isAutoRunAndFirstTime: boolean = false

  /**
   * Pipelines
   */
  readonly pipelines: any[] = []

  /**
   * Indicates whether run the pipeline or no
   */
  private canRunPipeline = true

  /**
   * Sequence number of session, only filled when the session has no session name assigned
   */
  sessionSequenceNumber?: number

  /**
   * Name of the session
   */
  sessionName?: string

  /**
   * List of input fields
   */
  readonly inputFields: Array<ToolInput<IF>> | ((inputValues: any) => Array<ToolInput<IF>>)

  /**
   * Component last state (scroll position, selection, undo / redo history)
   */
  @observable inputFieldsState: any = {}

  /**
   * Stored value for input
   */
  @observable inputValues: any = {}

  /**
   * Indicates input values has been changed
   */
  isInputValuesModified: boolean = false

  /**
   * List of output fields
   */
  readonly outputFields: Array<ToolOutput<OF>> | ((outputValues: any) => Array<ToolOutput<OF>>)

  /**
   * Component last state (scroll position, selection, undo / redo history)
   */
  @observable outputFieldsState: Record<string, any> = {}

  /**
   * Stored value for output
   */
  @observable outputValues: any = {}

  /**
   * Indicates output values has been changed
   */
  isOutputValuesModified: boolean = false

  /**
   * Action of tool.
   * Input always comes in form of Map as well as the returned value
   */
  readonly action: (input: any) => any

  /**
   * Number of tool has been running
   */
  @observable actionRunCount: number = 0

  /**
   * Indicates action is running asynchronous
   */
  @observable isActionRunning: boolean = false

  /**
   * Key input field for batch mode
   */
  @observable batchModeInputKey: string = ""

  /**
   * Key output field for batch mode
   */
  @observable batchModeOutputKey: string = ""

  /**
   * Indicates batch mode for tool
   */
  @observable isBatchModeEnabled: boolean = false

  isDeleting: boolean = false

  /**
   * Indicates tool has been deleted
   */
  @observable isDeleted: boolean = false

  /**
   * Used to force rerender tool input and output components by increasing the number
   */
  @observable renderCounter: number = 0

  /**
   * Key to be used for storing tool state in storage
   */
  readonly toolState?: ToolState = undefined

  /**
   * Disable persistence of tool
   */
  readonly disablePersistence: boolean = false

  readonly disableMultipleSession: boolean = false

  readonly hideOnSidebar: boolean = false

  /**
   * Additional data of tool based on type
   */
  readonly metadata?: ToolExtensionMetadata

  readonly samples: Array<IF | (() => IF)> = []

  @observable sampleIndex: number = 0

  @action
  setSampleIndex(index: number) {
    this.sampleIndex = index
  }

  getHasSamples() {
    return this.samples.length > 0
  }

  /**
   * Tool sessionId generator
   *
   * @returns
   */
  static generateSessionId(toolId: string) {
    return toolId.concat(generateRandomString(10, "1234567890qwertyuiopasdfghjklzxcvbnm"))
  }

  /**
   * Get toolId by parsing the sessionId string
   * @param sessionId
   * @returns
   */
  static getToolIdFromSessionId(sessionId: string) {
    return sessionId.split("|")[0]
  }

  /**
   * Empty instance of tool
   *
   * @returns
   */
  static empty() {
    return new Tool({
      name: "",
      toolId: "",
      category: "",
      action: () => ({}),
      inputFields: [],
      outputFields: []
    })
  }

  /**
   * Merge tool constructor with preset
   *
   * @param toolConstructor
   * @param preset
   * @returns
   */
  static mergeWithPreset(toolConstructor: ToolConstructor, preset: ToolPreset) {
    let presetInputs = []

    if (Array.isArray(toolConstructor.inputFields)) {
      presetInputs = [...toolConstructor.inputFields].map((input) => {
        /**
         * Assign input to new object because it still refers
         * to original variable, which is owned by main tool
         */
        const newInput = { ...input }
        newInput.defaultValue = preset.inputValues[input.key] ?? input.defaultValue
        return newInput
      })
    } else {
      const computedInputFields = toolConstructor.inputFields({})
      presetInputs = [...computedInputFields].map((input) => {
        /**
         * Assign input to new object because it still refers
         * to original variable, which is owned by main tool
         */
        const newInput = { ...input }
        newInput.defaultValue = preset.inputValues[input.key] ?? input.defaultValue
        return newInput
      })
    }

    const tool: ToolConstructor = {
      ...toolConstructor,
      name: preset.name,
      toolId: preset.presetId,
      inputFields: presetInputs,
      category: preset.category ?? toolConstructor.category,
      type: ToolType.Preset
    }

    return tool
  }

  /**
   * Tool Constructor
   */
  constructor(
    /**
     * Base tool constructor
     */
    toolConstructor: ToolConstructor<IF, OF>,

    /**
     * Additional options
     */
    options: {
      /**
       * Data will be merged into tool as initial state
       */
      initialState?: Partial<ToolState>

      /**
       * Disable persistence of tool
       */
      disablePersistence?: boolean
    } = {}
  ) {
    this.toolId = toolConstructor.toolId
    this.sessionId = toolConstructor.toolId === "" ? "" : Tool.generateSessionId(toolConstructor.toolId)
    this.name = toolConstructor.name
    this.action = toolConstructor.action ?? (() => ({}))
    this.category = toolConstructor.category
    this.inputFields = toolConstructor.inputFields
    this.outputFields = toolConstructor.outputFields
    this.pipelines = toolConstructor.pipelines ?? []
    this.autoRun = toolConstructor.autoRun ?? true
    this.type = toolConstructor.type ?? ToolType.Tool
    this.metadata = toolConstructor.metadata
    this.samples = toolConstructor.samples ?? []
    this.disableMultipleSession = toolConstructor.disableMultipleSession ?? false
    this.hideOnSidebar = toolConstructor.hideOnSidebar ?? false

    if (this.autoRun) {
      this.isAutoRunAndFirstTime = true
    }

    /**
     * Prepare default layout setting and merge with layout setting from tool constructor
     */
    this.layoutSetting = {
      direction: "horizontal",
      reversed: false,
      gridTemplate: "1fr 1fr",
      inputAreaDirection: "vertical",
      outputAreaDirection: "vertical",
      ...toolConstructor.layoutSetting
    }

    /**
     * Fill inputValues with value from tool inputFields
     */
    this.inputValues = this.getInputValuesWithDefault()

    /**
     * Set initial tool state
     */
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
    }

    if (this.disableMultipleSession) {
      this.sessionName = toolStore.mapOfLoadedTools[this.toolId].name
    }

    this.disablePersistence = disablePersistence

    makeObservable(this)
    this.setupPersistence()
  }

  /**
   * Setup persistence
   *
   * @returns
   */
  private setupPersistence() {
    /**
     * Delete previous stale persist store with same key of tool to avoid memory leaks
     */
    Array.from(PersistStoreMap.keys()).forEach((sessionKey) => {
      if (sessionKey?.sessionId === this.sessionId) {
        PersistStoreMap.delete(sessionKey)
      }
    })

    /**
     * Skip if it's an empty tool, disable persistence
     */
    if (!this.toolId || this.disablePersistence) {
      return
    }

    /**
     * Early put toolState into storage, because makePersistable did not
     * immediately seralize the state upon create the instance
     *
     * TODO: Shi-, I forgot why did I put this line here, what's the purpose?
     */
    // void ToolStateManager.putToolStateIntoStorage(this.sessionId, this.toState())

    /**
     * Watch changes of state and put into storage
     */
    void makePersistable(
      this,
      {
        name: StorageKeys.ToolState.concat(this.sessionId),
        properties: [
          {
            key: "toolState",
            serialize: () => {
              return this.toState()
            },
            deserialize: () => {
              /**
               * Do nothing when deserialize, because some properties are readonly
               * so we need to handle initial value through constructor
               */
              return this.toolState
            }
          }
        ]
      },
      {
        delay: 100
      }
    )
  }

  /**
   * Generate object of current tool state
   *
   * @returns
   */
  toState(): ToolState {
    const {
      batchModeInputKey: batchInputKey,
      batchModeOutputKey: batchOutputKey,
      inputFieldsState,
      inputValues,
      isBatchModeEnabled: isBatchEnabled,
      isDeleted,
      isInputValuesModified,
      isOutputValuesModified,
      outputFieldsState,
      outputValues,
      actionRunCount,
      sessionId,
      sessionName,
      sessionSequenceNumber,
      toolId,
      isAutoRunAndFirstTime
    } = this

    const createdAt = new Date().getTime()

    return {
      batchModeInputKey: batchInputKey,
      batchModeOutputKey: batchOutputKey,
      createdAt,
      inputFieldsState: toJS(inputFieldsState),
      inputValues: toJS(inputValues),
      isBatchModeEnabled: isBatchEnabled,
      isDeleted,
      isInputValuesModified,
      isOutputValuesModified,
      outputFieldsState: toJS(outputFieldsState),
      outputValues: toJS(outputValues),
      actionRunCount,
      sessionId,
      sessionName,
      sessionSequenceNumber,
      toolId,
      isAutoRunAndFirstTime
    }
  }

  /**
   * Get tool session data based on current state
   *
   * @returns
   */
  toSession(): ToolSession {
    const { sessionId, sessionName, sessionSequenceNumber, toolId } = this

    return { sessionId, sessionName, sessionSequenceNumber, toolId }
  }

  toHistory(): ToolHistory {
    const { sessionId, sessionName, toolId } = this
    const deletedAt = new Date().getTime()

    return { deletedAt, sessionId, sessionName, toolId }
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

  /**
   * Set batchInputKey and batchOutputKey with first fields
   * that has allowBatch true
   *
   * @param isEnabled
   */
  @action
  setBatchMode(isEnabled: boolean) {
    this.isBatchModeEnabled = isEnabled

    if (this.batchModeInputKey === "") {
      this.batchModeInputKey = this.getInputFields().filter((input) => input.allowBatch)[0].key
    }

    if (this.batchModeOutputKey === "") {
      this.batchModeOutputKey = this.getOutputFields().filter((output) => output.allowBatch)[0].key
    }
  }

  /**
   * Set value of batchOutputKey
   *
   * @param batchOutputKey
   */
  @action
  setBatchModeOutputKey(batchOutputKey: string) {
    this.batchModeOutputKey = batchOutputKey
  }

  /**
   * Set value of batchInputKey
   *
   * @param batchInputKey
   */
  @action
  setBatchModeInputKey(batchInputKey: string) {
    this.batchModeInputKey = batchInputKey
  }

  /**
   * Get input fields
   *
   * @returns
   */
  getInputFields() {
    if (typeof this.inputFields === "function") {
      return this.inputFields(this.inputValues)
    }
    return this.inputFields
  }

  /**
   * Filter input fields with matching mimeType
   *
   * @param mimeType
   * @returns
   */
  getInputFieldsWithReadableFile(): [Array<ToolInput<IF>>, boolean] {
    const inputFields = this.getInputFields()

    /**
     * Filter normal operation input fields
     */
    let hasAllowBatch = false
    const filteredInputFields = inputFields.filter((inputField) => {
      if (inputField.allowBatch) {
        hasAllowBatch = true
      }

      const inputToCompare = toolComponentService.getInputComponent(inputField.component)
      return !!inputToCompare.readFileAs
    })

    /**
     * Return if tool has fields with matching mimeType
     */
    if (filteredInputFields.length > 0) {
      return [filteredInputFields, false]
    }

    /**
     * Tool has no input fields with matching mimeType and
     * no fields with allowBatch enabled
     */
    if (!hasAllowBatch) {
      return [[], hasAllowBatch]
    }

    /**
     * Check batch fields that match with the provided mimeType
     */
    const filteredBatchInputFields = inputFields.filter((inputField) => {
      const inputToCompare = toolComponentService.getInputComponent(inputField.component, true)

      return !!inputToCompare.readFileAs
    })

    return [filteredBatchInputFields, true]
  }

  /**
   * Ger output fields
   *
   * @returns
   */
  getOutputFields() {
    if (typeof this.outputFields === "function") {
      return this.outputFields(this.inputValues)
    }
    return this.outputFields
  }

  /**
   * Set input params value by key
   *
   * @param key key of input
   * @param value value of input
   */
  @action
  setInputValue(key: string, value: unknown, options: { markAsModified: boolean } = { markAsModified: true }) {
    const newInputValues = { ...this.inputValues, [key]: value }

    /**
     * Value with type File cannot be compared using fastDeepEqual
     * Make this variable always true
     */
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

  /**
   * Replace values of tool input
   *
   * @param inputValues
   * @param options
   */
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

  /**
   * Set output params value by key
   *
   * @param outputValues
   */
  @action
  setOutputValue(key: string, value: unknown, options: { markAsModified: boolean } = { markAsModified: true }) {
    this.outputValues = { ...this.outputValues, [key]: value }

    if (!this.isAutoRunAndFirstTime) {
      this.isOutputValuesModified = options.markAsModified
    }
  }

  /**
   * Replace values of tool output
   *
   * @param outputValues
   */
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
   * Reset input and output values to its default value
   */
  @action
  resetInputAndOutputValues() {
    this.inputValues = this.getInputValuesWithDefault()
    this.outputValues = {}
  }

  /**
   * Get input params along with its default value
   *
   * @returns
   */
  getInputValuesWithDefault() {
    return Object.fromEntries(this.getInputFields().map((i) => [i.key, i.defaultValue]))
  }

  /**
   * Indicates whether tool has input, output and running at least once
   *
   * @returns boolean
   */
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

  /**
   * Set input field state by key
   *
   * @param key
   * @param state
   * @returns
   */
  @action
  setInputFieldState(key: string, state: unknown) {
    if (this.isDeleted) {
      return
    }

    this.inputFieldsState = { ...this.inputFieldsState, [key]: state }
  }

  /**
   * Set input field state by key
   *
   * @param key
   * @param state
   * @returns
   */
  @action
  setOutputFieldState(key: string, state: unknown) {
    if (this.isDeleted) {
      return
    }

    this.outputFieldsState = { ...this.outputFieldsState, [key]: state }
  }

  /**
   * Set input and output fields state to its default value
   */
  @action
  resetInputAndOutputFieldsState() {
    this.inputFieldsState = {}
    this.outputFieldsState = {}
  }

  @action
  private setIsActionRunning(value: boolean) {
    this.isActionRunning = value
    toolSessionStore.keepAliveSession(this.sessionId, value)
  }

  /**
   * Increment the number of runCount
   */
  @action
  private incrementActionRunCount() {
    this.actionRunCount = this.actionRunCount + 1
  }

  /**
   * Evaluate this tool action with input
   */
  async run() {
    if (this.isDeleted || this.isActionRunning) {
      return
    }

    if (this.type === ToolType.Extension) {
      void this.runExtension()
      return
    }

    if (this.canRunPipeline && this.pipelines.length > 0) {
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

  /**
   * Run action of tool
   *
   * @param actionInput
   * @returns
   */
  private async runAction(actionInput: any) {
    const runResult = await new Promise<any>((resolve) => {
      const result = this.action(actionInput)

      /**
       * Weird implementation to check wheter function is synchronous or asynchronous
       * But I think it should be fine ;)
       */
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

      const { actionFile } = this.metadata

      try {
        const inputParams = JSON.stringify({ ...this.inputValues })
        const command = Command.sidecar("binaries/node", [actionFile, inputParams])

        const result = await command.execute()
        this.setOutputValues(JSON.parse(result.stdout))
      } catch (exception) {
        console.log("Tool failed to run")
      }

      this.setIsActionRunning(false)
    }
  }

  /**
   * Run tool in normal behaviour
   *
   * @private
   */
  private async runNormal() {
    const runResult = await this.runAction({ ...this.inputValues })
    this.setOutputValues(runResult)
  }

  /**
   * Evaluate pipeline in tool
   *
   * @private
   */
  private async runPipeline() {
    const { pipelines = [] } = this
    const pipelineResults = []
    const pipelineTools = [this, ...pipelines, this]

    for (let i = 0; i < pipelineTools.length; i++) {
      const pipeline = pipelineTools[i]

      if (i === 0) {
        pipelineResults.push(pipeline.inputValues)
      } else if (i === pipelineTools.length - 1) {
        this.setOutputValues(pipelineResults[i - 1])
      } else {
        const toolConstructor = toolStore.mapOfLoadedTools[pipeline.toolId]
        const tool = new Tool(toolConstructor)
        tool.canRunPipeline = false

        const previousResult = pipelineResults[i - 1]
        pipeline.fields.forEach((field: any) => {
          if (field.previousOutputKey) {
            tool.setInputValue(field.inputKey, previousResult[field.previousOutputKey])
          } else if (field.value) {
            tool.setInputValue(field.inputKey, field.value)
          }
        })

        await tool.run()
        pipelineResults.push(tool.outputValues)
      }
    }
  }

  /**
   * Run tool in batch mode
   *
   * @private
   */
  private async runBatch() {
    const { inputValues, batchModeInputKey: batchInputKey } = this
    const batchInputValues = inputValues[batchInputKey]
    const inputLines = batchInputValues.split("\n")

    const outputs = []
    for (const inputLine of inputLines) {
      const runResult = await this.runAction({ ...inputValues, [batchInputKey]: inputLine })
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

  getToolHasIframe() {
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

  /**
   * Reset some properties to its default value
   */
  @action
  async markAsDeleted() {
    this.resetInputAndOutputFieldsState()
    this.setDeleted(true)

    /**
     * Manually update the storage if the tool is not persisting
     */
    if (!isPersisting(this)) {
      await ToolStorageManager.updateToolStatePropertyInStorage(this.sessionId, {
        inputFieldsState: {},
        outputFieldsState: {},
        isDeleted: true
      })
    }
  }
}
