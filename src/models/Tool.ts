import { Command } from "@tauri-apps/api/shell"
import fastDeepEqual from "fast-deep-equal"
import { observable, action, makeObservable, toJS } from "mobx"
import { PersistStoreMap, hydrateStore, makePersistable, pausePersisting, startPersisting, stopPersisting } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"
import { toolSessionStore } from "src/stores/toolSessionStore"
import { toolStore } from "src/stores/toolStore"
import { type MetadataExtension } from "src/types/MetadataExtension"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolInput } from "src/types/ToolInput"
import { type ToolLayoutSetting } from "src/types/ToolLayoutSetting"
import { type ToolOutput } from "src/types/ToolOutput"
import { type ToolPreset } from "src/types/ToolPreset"
import { type ToolSession } from "src/types/ToolSession"
import { type ToolState } from "src/types/ToolState"
import { generateRandomString } from "src/utils/generateRandomString"

export class Tool<
  IF extends Record<string, any> = any,
  OF extends Record<string, any> = any,
> implements ToolConstructor {
  /**
   * Tool ID
   */
  readonly toolId: string

  /**
   * Name of tool
   */
  readonly name: string

  /**
   * Unique ID of created session
   */
  readonly sessionId: string

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

  @observable inputFieldsState: any = {}

  @action
  setInputFieldState(key: string, state: unknown) {
    this.inputFieldsState = { ...this.inputFieldsState, [key]: state }
  }

  @action
  setOutputFieldState(key: string, state: unknown) {
    this.outputFieldsState = { ...this.outputFieldsState, [key]: state }
  }

  /**
   * List of output fields
   */
  readonly outputFields: Array<ToolOutput<OF>> | ((outputValues: any) => Array<ToolOutput<OF>>)

  @observable outputFieldsState: Record<string, any> = {}

  /**
   * Category of tool
   */
  readonly category: string

  /***
   * Tool layout setting
   */
  readonly layoutSetting: ToolLayoutSetting

  /**
   * Pipelines
   */
  readonly pipelines: any[] = []

  /**
   * Indicates whether run the pipeline or no
   */
  private canRunPipeline = true

  /**
   * Action of tool.
   * Input always comes in form of Map as well as the returned value
   */
  readonly action: (input: any) => any

  /**
   * Additional data of tool based on type
   */
  readonly metadata?: MetadataExtension

  /**
   * Stored value for input
   */
  @observable inputValues: any = {}

  /**
   * Stored value for output
   */
  @observable outputValues: any = {}

  /**
   * Indicates batch mode for tool
   */
  @observable isBatchEnabled: boolean = false

  /**
   * Key input field for batch mode
   */
  @observable batchInputKey: string | number | symbol = ""

  /**
   * Key output field for batch mode
   */
  @observable batchOutputKey: string | number | symbol = ""

  /**
   * Indicates tool has been deleted
   */
  @observable isDeleted: boolean = false

  /**
   * Used to force rerender tool input and output components by increasing the number
   */
  @observable renderCounter: number = 0

  /**
   * Indicates input values has been changed
   */
  isInputValuesModified: boolean = false

  /**
   * Indicates output values has been changed
   */
  isOutputValuesModified: boolean = false

  /**
   * Indicates action is running asynchronous
   */
  @observable isActionRunning: boolean = false

  /**
   * Should tools is auto run when user made changes on inputs, default is true
   */
  readonly autoRun: boolean = false

  /**
   * Type of tool
   */
  readonly type: "Tool" | "Pipeline" | "Preset" | "Extension" | undefined = "Tool"

  /**
   * Number of tool has been running
   */
  @observable runCount: number = 0

  /**
   * Key to be used for storing tool state in storage
   */
  toolState?: ToolState = undefined

  readonly disablePersistence: boolean = false

  /**
   * Tool sessionId generator
   *
   * @returns
   */
  static generateSessionId() {
    return generateRandomString(10, "1234567890qwertyuiopasdfghjklzxcvbnm")
  }

  static getToolIdFromSessionId(sessionId: string) {
    return sessionId.split("|")[0]
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
      type: "Preset"
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
    params: ToolConstructor<IF, OF>,

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
    const {
      action,
      category,
      toolId,
      inputFields,
      outputFields,
      name,
      metadata,
      pipelines = [],
      autoRun = true,
      type = "Tool",
      layoutSetting = {}
    } = params

    this.toolId = toolId
    this.sessionId = toolId.concat("|", Tool.generateSessionId())
    this.name = name
    this.action = action
    this.category = category
    this.inputFields = inputFields
    this.outputFields = outputFields
    this.pipelines = pipelines
    this.autoRun = autoRun
    this.type = type
    this.metadata = metadata

    /**
     * Prepare default layout setting and merge with layout setting from tool constructor
     */
    this.layoutSetting = {
      direction: "horizontal",
      reversed: false,
      gridTemplate: "1fr 1fr",
      inputAreaDirection: "vertical",
      outputAreaDirection: "vertical",
      ...layoutSetting
    }

    /**
     * Fill inputValues with value from tool inputFields
     */
    this.fillInputValuesWithDefault()

    /**
     * Set initial tool state
     */
    const { initialState, disablePersistence = false } = options
    if (initialState) {
      Object.assign(this, initialState)
    }

    this.disablePersistence = disablePersistence

    makeObservable(this)
    this.setupPersistence()
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
  toState(replacedValue: Partial<ToolState> = {}): ToolState {
    const {
      batchInputKey,
      batchOutputKey,
      inputFieldsState,
      inputValues,
      isBatchEnabled,
      isDeleted,
      isInputValuesModified,
      isOutputValuesModified,
      outputFieldsState,
      outputValues,
      runCount,
      sessionId,
      sessionName,
      sessionSequenceNumber,
      toolId
    } = this

    const createdAt = new Date().getTime()

    return {
      batchInputKey,
      batchOutputKey,
      createdAt,
      inputFieldsState: toJS(inputFieldsState),
      inputValues: toJS(inputValues),
      isBatchEnabled,
      isDeleted,
      isInputValuesModified,
      isOutputValuesModified,
      outputFieldsState: toJS(outputFieldsState),
      outputValues: toJS(outputValues),
      runCount,
      sessionId,
      sessionName,
      sessionSequenceNumber,
      toolId,
      ...replacedValue
    }
  }

  toSession(): ToolSession {
    const { sessionId, sessionName, sessionSequenceNumber, toolId } = this

    return { sessionId, sessionName, sessionSequenceNumber, toolId }
  }

  @action
  setIsDeleted(isDeleted: boolean) {
    this.isDeleted = isDeleted
  }

  /**
   * Set value of batchOutputKey
   *
   * @param batchOutputKey
   */
  @action
  setBatchOutputKey(batchOutputKey: string) {
    this.batchOutputKey = batchOutputKey
  }

  /**
   * Set value of batchInputKey
   *
   * @param batchInputKey
   */
  @action
  setBatchInputKey(batchInputKey: string) {
    this.batchInputKey = batchInputKey
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
   * Get input params along with its default value
   *
   * @returns
   */
  @action
  fillInputValuesWithDefault() {
    this.inputValues = Object.fromEntries(this.getInputFields().map((i) => [i.key, i.defaultValue]))
  }

  /**
   * Merge input params and output params and convert it to string
   */
  getInputAndOutputAsString() {
    return Object.values(this.inputValues ?? {}).concat(Object.values(this.outputValues ?? {})).toString().trim()
  }

  /**
   * Indicates whether tool has input, output and running at least once
   *
   * @returns boolean
   */
  getIsInputAndOutputHasValues(): boolean {
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
   * Set input params value
   *
   * @param key key of input
   * @param value value of input
   */
  @action
  setInputValue(key: any, value: any, options: { markAsModified: boolean } = { markAsModified: true }) {
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

    if (options.markAsModified) {
      this.isInputValuesModified = true
    }
  }

  setInputAndOutputValueToDefault() {
    this.fillInputValuesWithDefault()
    this.outputValues = {}
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
    this.isInputValuesModified = options.markAsModified
  }

  /**
   * Replace values of tool output
   *
   * @param outputValues
   */
  @action
  setOutputValues(outputValues: any, options: { markAsModified: boolean } = { markAsModified: true }) {
    this.outputValues = outputValues
    this.isOutputValuesModified = options.markAsModified
  }

  /**
   * Set batchInputKey and batchOutputKey with first fields
   * that has allowBatch true
   *
   * @param isEnabled
   */
  @action
  setBatchMode(isEnabled: boolean) {
    this.isBatchEnabled = isEnabled
    this.batchInputKey = this.getInputFields().filter((input) => input.allowBatch)[0].key
    this.batchOutputKey = this.getOutputFields().filter((output) => output.allowBatch)[0].key
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
  private incrementRunCount() {
    this.runCount = this.runCount + 1
  }

  /**
   * Evaluate this tool action with input
   */
  async run() {
    if (this.isDeleted || this.isActionRunning) {
      return
    }

    if (this.type === "Extension") {
      void this.runExtension()
      return
    }

    if (this.canRunPipeline && this.pipelines.length > 0) {
      await this.runPipeline()
    } else if (this.isBatchEnabled) {
      await this.runBatch()
    } else {
      await this.runNormal()
    }

    this.incrementRunCount()
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
    const { inputValues, batchInputKey } = this
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
  setSessionName(value: string) {
    this.sessionName = value
  }

  @action
  setSessionSequenceNumber(value?: number) {
    this.sessionSequenceNumber = value
  }

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
}
