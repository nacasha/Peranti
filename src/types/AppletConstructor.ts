import { type AppletType } from "src/enums/applet-type.ts"

import { type AppletActionParams } from "./AppletAction.ts"
import { type AppletInput } from "./AppletInput.ts"
import { type AppletOption } from "./AppletOption.ts"
import { type AppletOutput } from "./AppletOutput.ts"
import { type AppletSample } from "./AppletSample.ts"
import { type LayoutSetting } from "./LayoutSetting.ts"
import { type Pipeline } from "./Pipeline.ts"

export interface AppletConstructor<
  InputFields extends Record<string, any> = any,
  OutputFields extends Record<string, any> = any,
  OptionKeys extends Record<string, any> = any,
> {
  appletId: string
  name: string
  category: string
  inputFields: Array<AppletInput<InputFields>> | ((inputValues: InputFields) => Array<AppletInput<InputFields>>)
  outputFields: Array<AppletOutput<OutputFields>> | ((outputValues: OutputFields) => Array<AppletOutput<OutputFields>>)
  action?: (actionParams: AppletActionParams<InputFields, OptionKeys>) => OutputFields | Promise<OutputFields> | undefined
  layoutSetting?: LayoutSetting
  pipelines?: Pipeline[]
  autoRun?: boolean
  type?: AppletType
  samples?: Array<AppletSample<InputFields>>
  metadata?: any
  disableMultipleSession?: boolean
  hideOnSidebar?: boolean
  hasOverriddenDefaultState?: boolean
  description?: string
  options?: Array<AppletOption<OptionKeys>>
}
