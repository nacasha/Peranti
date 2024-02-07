import { type AppletType } from "src/enums/applet-type.ts"

import { type AppletInput } from "./AppletInput.ts"
import { type AppletOutput } from "./AppletOutput.ts"
import { type LayoutSetting } from "./LayoutSetting.ts"

export interface AppletConstructor<IF extends Record<string, any> = any, OF extends Record<string, any> = any> {
  appletId: string
  name: string
  category: string
  inputFields: Array<AppletInput<IF>> | ((inputParams: IF) => Array<AppletInput<IF>>)
  outputFields: Array<AppletOutput<OF>> | ((outputParams: OF) => Array<AppletOutput<OF>>)
  action?: (input: IF) => OF | Promise<OF> | undefined
  layoutSetting?: LayoutSetting
  pipelines?: any[]
  autoRun?: boolean
  type?: AppletType
  samples?: Array<IF | (() => IF)>
  metadata?: any
  disableMultipleSession?: boolean
  hideOnSidebar?: boolean
}
