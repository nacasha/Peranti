import type toast from "react-hot-toast"

import { type AppletType } from "src/enums/applet-type.ts"

import { type AppletInput } from "./AppletInput.ts"
import { type AppletOutput } from "./AppletOutput.ts"
import { type LayoutSetting } from "./LayoutSetting.ts"
import { type Pipeline } from "./Pipeline.ts"

export interface AppletConstructor<IF extends Record<string, any> = any, OF extends Record<string, any> = any> {
  appletId: string
  name: string
  category: string
  inputFields: Array<AppletInput<IF>> | ((inputParams: IF) => Array<AppletInput<IF>>)
  outputFields: Array<AppletOutput<OF>> | ((outputParams: OF) => Array<AppletOutput<OF>>)
  action?: (input: IF, activity: { toast: typeof toast }) => OF | Promise<OF> | undefined
  layoutSetting?: LayoutSetting
  pipelines?: Pipeline[]
  autoRun?: boolean
  type?: AppletType
  samples?: Array<Partial<IF> | (() => Partial<IF>)>
  metadata?: any
  disableMultipleSession?: boolean
  hideOnSidebar?: boolean
  hasOverriddenDefaultState?: boolean
}
