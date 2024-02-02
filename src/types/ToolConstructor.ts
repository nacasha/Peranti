import { type ToolType } from "src/enums/ToolType.ts"

import { type ToolInput } from "./ToolInput.ts"
import { type ToolLayoutSetting } from "./ToolLayoutSetting.ts"
import { type ToolOutput } from "./ToolOutput.ts"

export interface ToolConstructor<IF extends Record<string, any> = any, OF extends Record<string, any> = any> {
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
  inputFields: Array<ToolInput<IF>> | ((inputParams: IF) => Array<ToolInput<IF>>)

  /**
   * List of output fields for tool
   */
  outputFields: Array<ToolOutput<OF>> | ((outputParams: OF) => Array<ToolOutput<OF>>)

  /**
   * Category of tool
   */
  category: string

  /**
   * Action of tool.
   * Input always comes in form of Map as well as the returned value
   */
  action: (input: IF) => OF | Promise<OF> | undefined

  /**
   * Tool layout setting
   */
  layoutSetting?: ToolLayoutSetting

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
  type?: ToolType

  /**
   * Additional data for tool based on tool type
   */
  metadata?: any
}
