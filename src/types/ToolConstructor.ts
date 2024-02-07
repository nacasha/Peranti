import { type ToolType } from "src/enums/ToolType.ts"

import { type LayoutSetting } from "./LayoutSetting.ts"
import { type ToolInput } from "./ToolInput.ts"
import { type ToolOutput } from "./ToolOutput.ts"

export interface ToolConstructor<IF extends Record<string, any> = any, OF extends Record<string, any> = any> {

  toolId: string

  name: string

  inputFields: Array<ToolInput<IF>> | ((inputParams: IF) => Array<ToolInput<IF>>)

  outputFields: Array<ToolOutput<OF>> | ((outputParams: OF) => Array<ToolOutput<OF>>)

  category: string

  action?: (input: IF) => OF | Promise<OF> | undefined

  layoutSetting?: LayoutSetting

  pipelines?: any[]

  autoRun?: boolean

  type?: ToolType

  samples?: Array<IF | (() => IF)>

  metadata?: any

  disableMultipleSession?: boolean

  hideOnSidebar?: boolean
}
