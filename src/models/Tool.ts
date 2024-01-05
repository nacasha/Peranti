import { observable, action, makeObservable } from "mobx"

import { toolStore } from "src/stores/toolStore.ts"
import { type ToolHistory } from "src/types/ToolHistory"
import { type ToolInput } from "src/types/ToolInput"
import { type ToolOutput } from "src/types/ToolOutput"
import { generateSha256 } from "src/utils/generateSha256"

interface ToolConstructor {
  toolId: string
  name: string
  inputs: ToolInput[]
  outputs: ToolOutput[]
  category: string
  action: (input: any) => any
  layout?: "side-by-side" | "top-bottom" | "top-bottom-auto"
  inputsLayoutDirection?: "horizontal" | "vertical"
  outputsLayoutDirection?: "horizontal" | "vertical"
  pipelines?: any[]
}

export class Tool implements ToolConstructor {
  /**
   * Tool ID
   */
  readonly toolId: string

  /**
   * Name of tool
   */
  readonly name: string

  /**
   * Unique ID of created instance with this tool.
   */
  instanceId: string

  /**
   * List of input fields for tool
   */
  readonly inputs: ToolInput[]

  /**
   * List of output fields for tool
   */
  readonly outputs: ToolOutput[]

  /**
   * Category of tool
   */
  readonly category: string

  /**
   * Layout used to show the input and output area, default is "side-by-side"
   */
  readonly layout?: "side-by-side" | "top-bottom" | "top-bottom-auto"

  /**
   * Layout direction for input area
   */
  readonly inputsLayoutDirection?: "horizontal" | "vertical"

  /**
   * Layout direction for output area
   */
  readonly outputsLayoutDirection?: "horizontal" | "vertical"

  /**
   * Pipelines
   */
  readonly pipelines?: any[]

  /**
   * Indicates whether run the pipeline or no
   */
  shouldRunPipeline = true

  /**
   * Action of tool.
   * Input always comes in form of Map as well as the returned value
   */
  action: (input: any) => any

  /**
   * Stored value for input
   */
  @observable inputParams: any = {} as any

  /**
   * Stored value for output
   */
  @observable outputParams: Record<string, any> = {}

  /**
   * Indicates batch mode for tool
   */
  @observable isBatchEnabled: boolean = false

  /**
   * Key input of batch mode
   */
  @observable batchInputKey: string = ""

  /**
   * Key output of batch mode
   */
  @observable batchOutputKey: string = ""

  /**
   * Indicates tool input is read only
   */
  isReadOnly: boolean = false

  /**
   * Indicates tool has been running at least once
   */
  protected _hasRunning: boolean = false

  /**
   * Action of tool.
   * Input always comes in form of Map as well as the returned value
   */

  constructor(params: ToolConstructor) {
    const {
      action,
      category,
      toolId,
      inputs,
      outputs,
      name: title,
      layout,
      inputsLayoutDirection = "vertical",
      outputsLayoutDirection = "vertical",
      pipelines
    } = params

    this.toolId = toolId
    this.instanceId = toolId
    this.action = action
    this.category = category
    this.inputs = inputs
    this.outputs = outputs
    this.name = title
    this.layout = layout
    this.pipelines = pipelines
    this.inputsLayoutDirection = inputsLayoutDirection
    this.outputsLayoutDirection = outputsLayoutDirection

    // Set default value from tool definitions into inputParams
    this.inputParams = this.getInputParamsWithDefault()
  }

  /**
   * Load tool from history and make inputs read only
   *
   * @param mainTool
   * @param toolHistory
   */
  static openHistoryReadOnly(mainTool: Tool, toolHistory: ToolHistory) {
    const tool = new Tool({ ...mainTool })
    tool.instanceId = toolHistory.instanceId
    tool.inputParams = toolHistory.inputParams
    tool.outputParams = toolHistory.outputParams
    tool.isBatchEnabled = toolHistory.isBatchEnabled
    tool.batchInputKey = toolHistory.batchInputKey
    tool.batchOutputKey = toolHistory.batchOutputKey
    tool.isReadOnly = true
    return tool
  }

  /**
   * Load tool from history and make inputs read only
   *
   * @param mainTool
   * @param toolHistory
   */
  static openHistory(mainTool: Tool, toolHistory: Tool) {
    const tool = new Tool({ ...mainTool })
    tool.inputParams = toolHistory.inputParams
    tool.outputParams = toolHistory.outputParams
    tool.isBatchEnabled = toolHistory.isBatchEnabled
    tool.batchInputKey = toolHistory.batchInputKey
    tool.batchOutputKey = toolHistory.batchOutputKey
    return makeObservable(tool)
  }

  /**
   * Create empty tool
   */
  static empty() {
    return new Tool({
      name: "",
      toolId: "",
      category: "",
      action: () => ({}),
      inputs: [],
      outputs: []
    })
  }

  /**
   * Clone main tool and merge properties with preset
   *
   * @param mainTool
   * @param preset
   */
  static cloneToolBasedOnPreset(mainTool: Tool, preset: any) {
    const presetInputs = [...mainTool.inputs].map((input) => {
      /** Assign input to new object because it still refers to original variable, which is main tool */
      const newInput = { ...input }
      newInput.defaultValue = preset.inputParams[input.key] ?? input.defaultValue
      return newInput
    })

    return new Tool({
      ...mainTool,
      name: preset.name,
      toolId: preset.presetId,
      inputs: presetInputs
    })
  }

  /**
   * Open tool by cloning instance of created tool that shown on sidebar
   * As well as make it observable to the UI can react to variable changes
   *
   * @returns
   */
  openTool() {
    return makeObservable(new Tool({ ...this }))
  }

  /**
   * Generate object of current tool state to save into history
   *
   * @returns
   */
  toHistory(): ToolHistory {
    const { toolId, inputParams, outputParams, batchInputKey, batchOutputKey, isBatchEnabled } = this
    const instanceId = generateSha256(this.getInputAndOutputAsString())
    const createdAt = new Date().getTime()
    return { instanceId, toolId, inputParams, outputParams, createdAt, batchInputKey, batchOutputKey, isBatchEnabled }
  }

  /**
   * Get input params along with its default value
   *
   * @returns
   */
  getInputParamsWithDefault() {
    return Object.fromEntries(this.inputs.map((i) => [i.key, i.defaultValue]))
  }

  /**
   * Merge input params and output params and convert it to string
   */
  getInputAndOutputAsString() {
    return Object.values(this.inputParams).concat(Object.values(this.outputParams)).toString().trim()
  }

  /**
   * Indicates whether tool has input, output and running at least once
   *
   * @returns boolean
   */
  getIsDirty() {
    const hasInput = Object.values(this.inputParams).filter((value) => Boolean(value)).length > 0
    const hasOutput = Object.values(this.outputParams).filter((value) => Boolean(value)).length > 0

    return hasInput && hasOutput && this._hasRunning
  }

  /**
   * Set input params value
   *
   * @param key key of input
   * @param value value ofinput
   */
  @action
  setInputParamsValue(key: string, value: any) {
    this.inputParams = { ...this.inputParams, [key]: value }
  }

  @action
  setBatchMode(isEnabled: boolean) {
    const { inputs, outputs } = this

    this.isBatchEnabled = isEnabled
    this.batchInputKey = inputs.filter((input) => input.allowBatch)[0].key
    this.batchOutputKey = outputs.filter((output) => output.allowBatch)[0].key
  }

  /**
   * Evaluate this tool action with input
   */
  @action
  run() {
    if (this.isReadOnly) return

    const { pipelines } = this
    if (this.shouldRunPipeline && pipelines) {
      this.runPipeline()
      this._hasRunning = true
    } else if (this.isBatchEnabled) {
      const { inputParams, batchInputKey } = this
      const batchInputParams = inputParams[batchInputKey]
      const inputLines = batchInputParams.split("\n")

      const outputs = []
      for (const inputLine of inputLines) {
        outputs.push(this.action({ ...inputParams, [batchInputKey]: inputLine }))
      }

      const listOfOutputParams: Record<string, string[]> = outputs.reduce((sum, a) => {
        Object.entries(a).forEach(([key, value]) => {
          if (!sum[key]) sum[key] = []
          sum[key].push(value)
        })

        return sum
      }, {})

      this.outputParams = Object.fromEntries(
        Object.entries(listOfOutputParams).map(([key, value]) => [key, value.join("\n")])
      )
      this._hasRunning = true
    } else {
      this.outputParams = this.action({ ...this.inputParams })
      this._hasRunning = true
    }
  }

  /**
   * Evaluate pipeline in tool
   *
   * @private
   */
  private runPipeline() {
    const { pipelines = [] } = this
    const pipelineResults = []
    const pipelineTools = [this, ...pipelines, this]

    for (let i = 0; i < pipelineTools.length; i++) {
      const pipeline = pipelineTools[i]

      if (i === 0) {
        pipelineResults.push(pipeline.inputParams)
      } else if (i === pipelineTools.length - 1) {
        this.outputParams = pipelineResults[i - 1]
      } else {
        const tool = toolStore.mapOfTools[pipeline.toolId]
        const toolInstance = tool.openTool()
        toolInstance.shouldRunPipeline = false

        const previousResult = pipelineResults[i - 1]
        pipeline.fields.forEach((field: any) => {
          if (field.previousOutputKey) {
            toolInstance.setInputParamsValue(field.inputKey, previousResult[field.previousOutputKey])
          } else if (field.value) {
            toolInstance.setInputParamsValue(field.inputKey, field.value)
          }
        })

        toolInstance.run()
        pipelineResults.push(toolInstance.outputParams)
      }
    }
  }
}
