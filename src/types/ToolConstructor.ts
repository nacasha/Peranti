import { type ToolLayoutEnum } from "src/enums/ToolLayoutEnum"

import { type ToolInput } from "./ToolInput.js"
import { type ToolOutput } from "./ToolOutput.js"

export interface ToolConstructor<
  InputFields extends Record<string, any> = any,
  OutputFields extends Record<string, any> = any,
> {
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
  inputFields: Array<ToolInput<InputFields>>
  | ((inputParams: any) => Array<ToolInput<InputFields>>)

  /**
   * List of output fields for tool
   */
  outputFields: Array<ToolOutput<OutputFields>>
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

  /**
   * Type of tool
   */
  type?: "Tool" | "Pipeline" | "Preset"
}
