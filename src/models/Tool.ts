import { Command } from "@tauri-apps/api/shell"
import fastDeepEqual from "fast-deep-equal"
import localforage from "localforage"
import hashMd5 from "md5"
import { observable, action, makeObservable, toJS } from "mobx"
import { PersistStoreMap, isPersisting, makePersistable, stopPersisting } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"
import { toolSessionStore } from "src/stores/toolSessionStore"
import { toolStore } from "src/stores/toolStore"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolHistory } from "src/types/ToolHistory"
import { type ToolInput } from "src/types/ToolInput"
import { type ToolLayoutSetting } from "src/types/ToolLayoutSetting"
import { type ToolOutput } from "src/types/ToolOutput"
import { type ToolPreset } from "src/types/ToolPreset"
import { type ToolSession } from "src/types/ToolSession"
import { generateRandomString } from "src/utils/generateRandomString"
import { generateSha256 } from "src/utils/generateSha256"

export class Tool<
  InputFields extends Record<string, any> = any,
  OutputFields extends Record<string, any> = any,
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
   * Unique ID of each created instance with this tool.
   */
  readonly sessionId: string

  /**
   * Index of untitled session name
   */
  sessionSequenceNumber?: number

  /**
   * Session name to be showed on tabbar
   */
  sessionName?: string

  /**
   * List of input fields for tool
   */
  readonly inputFields: Array<ToolInput<InputFields>>
  | ((inputValues: any) => Array<ToolInput<InputFields>>)

  /**
   * List of output fields for tool
   */
  readonly outputFields: Array<ToolOutput<OutputFields>>
  | ((outputValues: any) => Array<ToolOutput<OutputFields>>)

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
   * Indicated tool must be running on the first time running
   */
  readonly runOnFirstTimeOpen: boolean = true

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
  readonly metadata?: any

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
   * Key input of batch mode
   */
  @observable batchInputKey: string | number | symbol = ""

  /**
   * Key output of batch mode
   */
  @observable batchOutputKey: string | number | symbol = ""

  /**
   * Indicates tool input is read only
   */
  @observable readonly isReadOnly: boolean = false

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

  toolHistory?: ToolHistory = undefined

  readonly disablePersistence: boolean = false

  get localStorageKey() {
    return StorageKeys.Tool.concat(this.sessionId)
  }

  /**
   * Tool sessionId generator
   *
   * @returns
   */
  static generateSessionId() {
    const randomString = generateRandomString(10, "1234567890qwertyuiopasdfghjklzxcvbnm")
    return hashMd5(new Date().getTime().toString().concat(randomString))
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
      inputFields: presetInputs as any,
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
    params: ToolConstructor<InputFields, OutputFields>,

    /**
     * Additional options
     */
    options: {
      /**
       * Data will be merged into tool as initial state
       */
      initialState?: Partial<ToolHistory>

      /**
       * Make tool as read only
       */
      isReadOnly?: boolean

      /**
       * Set session name of tool
       */
      sessionName?: string

      sessionSequenceNumber?: number

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
    this.sessionId = Tool.generateSessionId()
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
      inputAreaSize: "1fr",
      inputAreaDirection: "vertical",
      outputAreaSize: "1fr",
      outputAreaDirection: "vertical",
      ...layoutSetting
    }

    /**
     * Fill inputValues with value from tool input fields
     */
    this.fillInputValuesWithDefault()

    const {
      isReadOnly = false,
      initialState,
      sessionName,
      disablePersistence = false,
      sessionSequenceNumber
    } = options
    let assignedSessionName

    if (initialState) {
      this.sessionId = initialState.sessionId ?? this.sessionId
      this.sessionSequenceNumber = initialState.sessionSequenceNumber ?? this.sessionSequenceNumber
      this.isBatchEnabled = initialState.isBatchEnabled ?? this.isBatchEnabled
      this.batchInputKey = initialState.batchInputKey ?? this.batchInputKey
      this.batchOutputKey = initialState.batchOutputKey ?? this.batchOutputKey
      this.runCount = initialState.runCount ?? this.runCount
      this.inputValues = initialState.inputValues ?? this.inputValues
      this.outputValues = initialState.outputValues ?? this.outputValues

      assignedSessionName = initialState.sessionName
    }

    if (!this.sessionSequenceNumber) {
      this.sessionSequenceNumber = sessionSequenceNumber
    }

    if (!assignedSessionName) {
      assignedSessionName = sessionName
    }

    this.isReadOnly = isReadOnly
    this.sessionName = assignedSessionName
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
     * Skip if it's an empty tool, disable persistence or already persisting
     */
    if (!this.toolId || this.disablePersistence || isPersisting(this)) {
      return
    }

    void makePersistable(this, {
      name: this.localStorageKey,
      properties: [
        {
          key: "toolHistory",
          serialize: () => {
            return this.toHistory()
          },
          deserialize: () => {
            /**
             * Do nothing when deserialize, as it is already handled
             * by Tool Constructor and ToolSessionStore.getToolFromLocalStorage
             */
            return this
          }
        }
      ] as any
    })
  }

  stopStore() {
    stopPersisting(this)
  }

  destroyLocalStorage() {
    void localforage.removeItem(this.localStorageKey)
  }

  /**
   * Generate object of current tool state to save into history
   *
   * @returns
   */
  toHistory(): ToolHistory {
    const {
      batchInputKey,
      batchOutputKey,
      inputValues,
      isBatchEnabled,
      outputValues,
      runCount,
      sessionId,
      sessionName,
      sessionSequenceNumber,
      toolId
    } = this

    const createdAt = new Date().getTime()
    const inputOutputHash = generateSha256(this.getInputAndOutputAsString())

    return {
      sessionId,
      sessionName,
      sessionSequenceNumber,
      toolId,
      inputValues: toJS(inputValues),
      outputValues: toJS(outputValues),
      inputOutputHash,
      createdAt,
      isBatchEnabled,
      batchInputKey,
      batchOutputKey,
      runCount
    }
  }

  toSession(): ToolSession {
    const { sessionId, sessionName, sessionSequenceNumber, toolId } = this

    return { sessionId, sessionName, sessionSequenceNumber, toolId }
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
  getIsInputAndOutputHasValues() {
    const hasInputValues = Object.values(this.inputValues).filter((value) => Boolean(value)).length > 0
    const hasOutputValues = Object.values(this.outputValues).filter((value) => Boolean(value)).length > 0

    return hasInputValues || hasOutputValues
  }

  /**
   * Set input params value
   *
   * @param key key of input
   * @param value value of input
   */
  @action
  setInputValue(key: string, value: any, options: { markAsModified: boolean } = { markAsModified: true }) {
    const newInputValues = { ...this.inputValues, [key]: value }
    const inputValuesHasChanged = !fastDeepEqual(this.inputValues, newInputValues)

    if (inputValuesHasChanged) {
      this.inputValues = { ...this.inputValues, [key]: value }
    }

    if (options.markAsModified) {
      this.isInputValuesModified = true
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

    if (options.markAsModified) {
      this.isInputValuesModified = true
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

    if (options.markAsModified) {
      this.isOutputValuesModified = true
    }
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
    if (this.isReadOnly || this.isActionRunning) {
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
    /**
     * Weird implementation to check async action or not, but okay
     */
    const runResult = await new Promise<any>((resolve) => {
      const result = this.action(actionInput)

      if ("then" in result) {
        this.setIsActionRunning(true)
        result.then((data: any) => {
          this.setIsActionRunning(false)
          resolve(data)
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
}
