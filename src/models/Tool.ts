import { observable, action, makeObservable } from "mobx"
import { type ToolHistory } from "src/types/ToolHistory"
import { type ToolInput } from "src/types/ToolInput"
import { type ToolOutput } from "src/types/ToolOutput"
import { generateRandomString } from "src/utils/generateRandomString"

interface ToolConstructor {
  toolId: string
  name: string
  inputs: ToolInput[]
  outputs: ToolOutput[]
  category: string
  action: (input: any) => any
  layout?: "side-by-side" | "top-bottom" | "top-bottom-auto"
}

export class Tool implements ToolConstructor {
  /**
   * Tool ID
   */
  toolId: string

  /**
   * Name of tool
   */
  name: string

  /**
   * Unique ID of created instance with this tool.
   */
  instanceId: string

  /**
   * List of input fields for tool
   */
  inputs: ToolInput[]

  /**
   * List of output fields for tool
   */
  outputs: ToolOutput[]

  /**
   * Category of tool
   */
  category: string

  /**
   * Layout used to show the input and output area, default is "side-by-side"
   */
  layout?: "side-by-side" | "top-bottom" | "top-bottom-auto"

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
   * Indicates tool input is read only
   */
  isReadOnly: boolean = false

  /**
   * Indicates tool has been running at least once
   */
  protected hasRunning: boolean = false

  /**
   * Action of tool.
   * Input always comes in form of Map as well as the returned value
   */

  constructor(params: ToolConstructor) {
    const { action, category, toolId, inputs, outputs, name: title, layout } = params
    this.toolId = toolId
    this.instanceId = toolId
    this.action = action
    this.category = category
    this.inputs = inputs
    this.outputs = outputs
    this.name = title
    this.layout = layout
  }

  /**
   * Load tool from history and make inputs read only
   *
   * @param toolHistory
   */
  static fromHistory(mainTool: Tool, toolHistory: ToolHistory, readOnly = true) {
    const tool = new Tool({ ...mainTool })
    tool.instanceId = toolHistory.instanceId
    tool.inputParams = toolHistory.inputParams
    tool.outputParams = toolHistory.outputParams
    tool.isReadOnly = readOnly
    return tool
  }

  /**
   * Generate object of current tool state to save into history
   *
   * @returns
   */
  toHistory(): ToolHistory {
    const { instanceId: originalInstanceId, toolId, inputParams, outputParams } = this
    const instanceId = originalInstanceId.concat(generateRandomString(15))
    const createdAt = new Date().getTime()
    return { instanceId, toolId, inputParams, outputParams, createdAt }
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
   * Load tool from history and make inputs read only
   *
   * @param toolHistory
   */
  static openFromHistory(mainTool: Tool, toolHistory: Tool) {
    const tool = new Tool({ ...mainTool })
    tool.inputParams = toolHistory.inputParams
    tool.outputParams = toolHistory.outputParams
    return makeObservable(tool)
  }

  /**
   * Get list of input keys
   *
   * @returns string[]
   */
  getInputKeys() {
    return this.inputs.map((input) => input.key)
  }

  /**
   * Get input params along with it's default value
   *
   * @returns
   */
  getInputParamsWithDefault() {
    return Object.fromEntries(this.inputs.map((i) => [i.key, i.defaultValue]))
  }

  /**
   * Get list of output keys
   *
   * @returns string[]
   */
  getOutputKeys() {
    return this.outputs.map((output) => output.key)
  }

  /**
   * Indicates whether tool has input or output
   *
   * @returns boolean
   */
  getIsDirty() {
    const hasInput = Object.values(this.inputParams).filter((value) => Boolean(value)).length > 0
    const hasOutput = Object.values(this.outputParams).filter((value) => Boolean(value)).length > 0

    return hasInput && hasOutput && this.hasRunning
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

  /**
   * Evaluate this tool action with input
   */
  @action
  run() {
    if (this.isReadOnly) return

    const fieldsWithDefaultValue = this.getInputParamsWithDefault()
    this.outputParams = this.action({ ...fieldsWithDefaultValue, ...this.inputParams })
    this.hasRunning = true
  }
}
