import { type ToolInput } from "./ToolInput"
import { type ToolOutput } from "./ToolOutput"

export interface Tool {
  /**
   * Unique ID of tool
   */
  id: string

  /**
   * Title of tool that will be shown at header
   */
  title: string

  /**
   * Action of tool.
   * Input always comes in form of Map as well as the returned value
   */
  action: (input: any) => any

  /**
   * List of input fields for tool
   */
  inputs: ToolInput[]

  /**
   * List of output fields for tool
   */
  outputs: ToolOutput[]

  /**
   * Layout used to show the input and output area, default is "side-by-side"
   */
  layout?: "side-by-side" | "top-bottom" | "top-bottom-auto"

  /**
   * List of keywords to describe the utilities of tool
   */
  keywords?: string[]

  /**
   * Category of tool
   */
  category: string

  /**
   * Pipelines of tool
   */
  pipelines?: [
    {
      id: "step-1-xxx"
      tool: "hash"
      inputMaps: [
        { source: "input", target: "input" }
      ]
    }
  ]
}
