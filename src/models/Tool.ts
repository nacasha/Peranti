import fastDeepEqual from "fast-deep-equal"
import { observable, action, makeObservable } from "mobx"

import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { toolStore } from "src/stores/toolStore.ts"
import { type ToolHistory } from "src/types/ToolHistory"
import { type ToolInput } from "src/types/ToolInput"
import { type ToolOutput } from "src/types/ToolOutput"
import { generateSha256 } from "src/utils/generateSha256"

interface ToolConstructor<InputFields extends Record<string, any> = any,
  OutputFields extends Record<string, any> = any> {
  /**
   * Tool ID
   */
  toolId: string

  /**
   * Name of tool
   */
  name: string

  /**
   * List of input fields for tool
   */
  inputs: Array<ToolInput<InputFields>>
  | ((inputParams: any) => Array<ToolInput<InputFields>>)

  /**
   * List of output fields for tool
   */
  outputs: Array<ToolOutput<OutputFields>>
  | ((outputParams: any) => Array<ToolOutput<OutputFields>>)

  /**
   * Category of tool
   */
  category: string

  /**
   * Action of tool.
   * Input always comes in form of Map as well as the returned value
   */
  action: (input: InputFields) => OutputFields | undefined | Promise<OutputFields>

  /**
   * Layout used to show the input and output area, default is "side-by-side"
   */
  layout?: ToolLayoutEnum

  /**
   * Swap input and output position in tool area, default is "false"
   */
  layoutReversed?: boolean

  /**
   * Layout direction for input area, default is "vertical"
   */
  inputsLayoutDirection?: "horizontal" | "vertical"

  /**
   * Layout direction for output area, default is "vertical"
   */
  outputsLayoutDirection?: "horizontal" | "vertical"

  /**
   * Pipelines
   */
  pipelines?: any[]

  /**
   * Should tools is auto run when user made changes on inputs, default is true
   */
  autoRun?: boolean
}

export class Tool<InputFields extends Record<string, any> = any,
  OutputFields extends Record<string, any> = any
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
  instanceId: string

  /**
   * List of input fields for tool
   */
  readonly inputs: Array<ToolInput<InputFields>>
  | ((inputParams: any) => Array<ToolInput<InputFields>>)

  /**
   * List of output fields for tool
   */
  readonly outputs: Array<ToolOutput<OutputFields>>
  | ((outputParams: any) => Array<ToolOutput<OutputFields>>)

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
  @observable batchInputKey: string | number | symbol = ""

  /**
   * Key output of batch mode
   */
  @observable batchOutputKey: string | number | symbol = ""

  /**
   * Indicates tool input is read only
   */
  isReadOnly: boolean = false

  /**
   * Indicates tool has been running at least once
   */
  protected _hasRunning: boolean = false

  /**
   * Should tools is auto run when user made changes on inputs, default is true
   */
  readonly autoRun: boolean = false

  /**
   * Action of tool.
   * Input always comes in form of Map as well as the returned value
   */
  constructor(params: ToolConstructor<InputFields, OutputFields>) {
    const {
      action,
      category,
      toolId,
      inputs,
      outputs,
      name,
      layout = ToolLayoutEnum.SideBySide,
      layoutReversed = false,
      inputsLayoutDirection = "vertical",
      outputsLayoutDirection = "vertical",
      pipelines = [],
      autoRun = true
    } = params

    this.toolId = toolId
    this.action = action
    this.category = category
    this.inputs = inputs
    this.outputs = outputs
    this.name = name
    this.layout = layout
    this.layoutReversed = layoutReversed
    this.pipelines = pipelines
    this.inputsLayoutDirection = inputsLayoutDirection
    this.outputsLayoutDirection = outputsLayoutDirection
    this.autoRun = autoRun

    /**
     * Instance ID of initial tool is the toolId itself,
     * and will be generated when creating new instance of tool (opening tool from sidebar)
     */
    this.instanceId = toolId

    /**
     * Set inputParams for default value fields from tool definitions
     */
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
  static openHistory(mainTool: Tool, toolHistory: ToolHistory) {
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
    const presetInputs = [...mainTool.getInputs()].map((input) => {
      /** Assign input to new object because it still refers to original variable, which is main tool */
      const newInput = { ...input }
      newInput.defaultValue = preset.inputParams[input.key] ?? input.defaultValue
      return newInput
    })

    return new Tool({
      ...mainTool,
      name: preset.name,
      toolId: preset.presetId,
      inputs: presetInputs as any
    })
  }

  generateInstanceId() {
    return generateSha256(new Date().getTime().toString())
  }

  /**
   * Open tool by cloning instance of initial tool that shown on sidebar
   * This is done to avoid modifying the initial state of tool
   * Make it observable, generating new instanceId and disable readOnly
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

    const createdAt = new Date().getTime()
    const inputOutputHash = generateSha256(this.getInputAndOutputAsString())

    /**
     * Generate new instanceId for history
     * This is done to avoid same instanceId for tool that currently shown in the App
     */
    const instanceId = this.generateInstanceId()

    return {
      instanceId,
      toolId,
      inputParams,
      outputParams,
      inputOutputHash,
      createdAt,
      isBatchEnabled,
      batchInputKey,
      batchOutputKey
    }
  }

  getInputs() {
    if (typeof this.inputs === "function") {
      return this.inputs(this.inputParams)
    }
    return this.inputs
  }

  getOutputs() {
    if (typeof this.outputs === "function") {
      return this.outputs(this.inputParams)
    }
    return this.outputs
  }

  /**
   * Get input params along with its default value
   *
   * @returns
   */
  getInputParamsWithDefault() {
    return Object.fromEntries(this.getInputs().map((i) => [i.key, i.defaultValue]))
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
   * @param value value of input
   */
  @action
  setInputParamsValue(key: string, value: any) {
    const newInputParams = { ...this.inputParams, [key]: value }
    const inputParamsHasChanged = !fastDeepEqual(this.inputParams, newInputParams)

    if (inputParamsHasChanged) {
      this.inputParams = { ...this.inputParams, [key]: value }
    }
  }

  @action
  setOutputParams(outputParams: any) {
    this.outputParams = outputParams
  }

  @action
  setBatchMode(isEnabled: boolean) {
    this.isBatchEnabled = isEnabled
    this.batchInputKey = this.getInputs().filter((input) => input.allowBatch)[0].key
    this.batchOutputKey = this.getOutputs().filter((output) => output.allowBatch)[0].key
  }

  /**
   * Evaluate this tool action with input
   */
  @action
  async run() {
    if (this.isReadOnly) return

    const { pipelines } = this
    if (this.shouldRunPipeline && pipelines.length > 0) {
      await this.runPipeline()
      this._hasRunning = true
    } else if (this.isBatchEnabled) {
      this.runBatch()
      this._hasRunning = true
    } else {
      const runResult = await this.action({ ...this.inputParams })
      this.setOutputParams(runResult)
      this._hasRunning = true
    }
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
        pipelineResults.push(pipeline.inputParams)
      } else if (i === pipelineTools.length - 1) {
        this.setOutputParams(pipelineResults[i - 1])
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

        await toolInstance.run()
        pipelineResults.push(toolInstance.outputParams)
      }
    }
  }

  /**
   * Run tool in batch mode
   *
   * @private
   */
  private runBatch() {
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

    this.setOutputParams(
      Object.fromEntries(
        Object.entries(listOfOutputParams).map(([key, value]) => [key, value.join("\n")])
      )
    )
  }
}
