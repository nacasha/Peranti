import fastDeepEqual from "fast-deep-equal"
import { observable, action, makeObservable, toJS } from "mobx"

import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { toolStore } from "src/stores/toolStore"
import { type ToolConstructor } from "src/types/ToolConstructor"
import { type ToolHistory } from "src/types/ToolHistory"
import { type ToolInput } from "src/types/ToolInput"
import { type ToolOutput } from "src/types/ToolOutput"
import { type ToolPreset } from "src/types/ToolPreset"
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

  /**
   * Layout used to show the input and output area, default is "side-by-side"
   */
  readonly layout: ToolLayoutEnum

  /**
   * Swap input and output position in tool area, default is "false"
   */
  readonly layoutReversed: boolean = false

  /**
   * Layout direction for input area, default is "vertical"
   */
  readonly inputsLayoutDirection?: "horizontal" | "vertical"

  /**
   * Layout direction for output area, default is "vertical"
   */
  readonly outputsLayoutDirection?: "horizontal" | "vertical"

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

  isInputValuesModified: boolean = false

  isOutputValuesModified: boolean = false

  /**
   * Should tools is auto run when user made changes on inputs, default is true
   */
  readonly autoRun: boolean = false

  /**
   * Type of tool
   */
  readonly type: "Tool" | "Pipeline" | "Preset" | undefined = "Tool"

  /**
   * Number of tool has been running
   */
  @observable runCount: number = 0

  /**
   * Tool sessionId generator
   *
   * @returns
   */
  static generateSessionId() {
    return generateSha256(new Date().getTime().toString())
  }

  /**
   * Merge tool constructor with preset
   *
   * @param toolConstructor
   * @param preset
   * @returns
   */
  static mergeWithPresets(toolConstructor: ToolConstructor, preset: ToolPreset) {
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
      type: "Preset"
    }

    return tool
  }

  /**
   * Tool Constructor
   */
  constructor(
    params: ToolConstructor<InputFields, OutputFields>,
    options: { toolHistory?: ToolHistory, isReadOnly?: boolean } = {}
  ) {
    const {
      action,
      category,
      toolId,
      inputFields,
      outputFields,
      name,
      layout = ToolLayoutEnum.SideBySide,
      layoutReversed = false,
      inputsLayoutDirection = "vertical",
      outputsLayoutDirection = "vertical",
      pipelines = [],
      autoRun = true,
      type = "Tool"
    } = params

    this.toolId = toolId
    this.sessionId = Tool.generateSessionId()
    this.name = name
    this.action = action
    this.category = category
    this.inputFields = inputFields
    this.outputFields = outputFields
    this.layout = layout
    this.layoutReversed = layoutReversed
    this.pipelines = pipelines
    this.inputsLayoutDirection = inputsLayoutDirection
    this.outputsLayoutDirection = outputsLayoutDirection
    this.autoRun = autoRun
    this.type = type

    /**
     * Fill inputValues with value from tool input fields
     */
    this.fillInputValuesWithDefault()

    const { isReadOnly = false, toolHistory } = options
    if (toolHistory) {
      this.sessionId = toolHistory.sessionId
      this.isBatchEnabled = toolHistory.isBatchEnabled
      this.batchInputKey = toolHistory.batchInputKey
      this.batchOutputKey = toolHistory.batchOutputKey

      this.setInputValues(toolHistory.inputValues, { markAsModified: false })
      this.setOutputValues(toolHistory.outputValues, { markAsModified: false })

      /**
       * Disable run on first time open because input values already filled from history state
       */
      this.runOnFirstTimeOpen = false
    }

    this.isReadOnly = isReadOnly

    makeObservable(this)
  }

  /**
   * Generate object of current tool state to save into history
   *
   * @returns
   */
  toHistory(options: { randomizeSessionId?: boolean } = {}): ToolHistory {
    const { randomizeSessionId = false } = options
    const { toolId, inputValues, outputValues, batchInputKey, batchOutputKey, isBatchEnabled } = this

    const createdAt = new Date().getTime()
    const inputOutputHash = generateSha256(this.getInputAndOutputAsString())
    const randomizedSessionId = Tool.generateSessionId()

    return {
      sessionId: randomizeSessionId ? randomizedSessionId : this.sessionId,
      toolId,
      inputValues: toJS(inputValues),
      outputValues: toJS(outputValues),
      inputOutputHash,
      createdAt,
      isBatchEnabled,
      batchInputKey,
      batchOutputKey
    }
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
    return Object.values(this.inputValues).concat(Object.values(this.outputValues)).toString().trim()
  }

  /**
   * Indicates whether tool has input, output and running at least once
   *
   * @returns boolean
   */
  getIsInputAndOutputHasValues() {
    const hasInputValues = Object.values(this.inputValues).filter((value) => Boolean(value)).length > 0
    const hasOutputValues = Object.values(this.outputValues).filter((value) => Boolean(value)).length > 0

    return hasInputValues && hasOutputValues
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
    if (this.isReadOnly) return

    if (this.canRunPipeline && this.pipelines.length > 0) {
      await this.runPipeline()
    } else if (this.isBatchEnabled) {
      await this.runBatch()
    } else {
      await this.runNormal()
    }

    this.incrementRunCount()
  }

  /**
   * Run tool in normal behaviour
   *
   * @private
   */
  private async runNormal() {
    const runResult = await this.action({ ...this.inputValues })
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
        const toolConstructor = toolStore.mapOfTools[pipeline.toolId]
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
      const runResult = await this.action({ ...inputValues, [batchInputKey]: inputLine })
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
