import { observable, action, makeObservable } from "mobx"
import { type ToolInput } from "src/types/ToolInput"
import { type ToolOutput } from "src/types/ToolOutput"

interface ToolConstructor {
  id: string
  title: string
  inputs: ToolInput[]
  outputs: ToolOutput[]
  category: string
  action: (input: any) => any
  layout?: "side-by-side" | "top-bottom" | "top-bottom-auto"
}

function generateRandomString(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}

export class Tool {
  /**
   * Unique ID of tool
   */
  id: string

  /**
   * Title of tool that will be shown at header
   */
  title: string

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
   * Indicates whether tool is part is history
   */
  isHistory: boolean = false

  /**
   * Action of tool.
   * Input always comes in form of Map as well as the returned value
   */

  constructor(params: ToolConstructor) {
    const { action, category, id, inputs, outputs, title, layout } = params
    this.id = id
    this.action = action
    this.category = category
    this.inputs = inputs
    this.outputs = outputs
    this.title = title
    this.layout = layout

    makeObservable(this)
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

    return hasInput || hasOutput
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
    const fieldsWithDefaultValue = this.getInputParamsWithDefault()

    this.outputParams = this.action({ ...fieldsWithDefaultValue, ...this.inputParams })
  }

  /**
   * Create new session of tool with default state of class
   *
   * @returns
   */
  openTool() {
    if (this.getIsDirty()) {
      return this
    }

    return new Tool({ ...this })
  }

  /**
   * Generate new ID with random string
   */
  stateToHistory() {
    this.id = this.id.concat(generateRandomString(15))
    this.isHistory = true
  }
}
