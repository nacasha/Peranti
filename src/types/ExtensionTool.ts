import { type AppletInput } from "./AppletInput.ts"
import { type AppletOutput } from "./AppletOutput.ts"
import { type LayoutSetting } from "./LayoutSetting.ts"

export interface ExtensionTool<IF extends Record<string, any> = any, OF extends Record<string, any> = any> {
  toolId: string
  name: string
  category: string
  actionFile: string
  inputFields: Array<AppletInput<IF>> | ((inputParams: IF) => Array<AppletInput<IF>>)
  outputFields: Array<AppletOutput<OF>> | ((outputParams: OF) => Array<AppletOutput<OF>>)
  layoutSetting?: LayoutSetting
  autoRun?: boolean
  samples?: Array<Partial<IF> | (() => Partial<IF>)>
  disableMultipleSession?: boolean
}
