import { type AppletInput } from "./AppletInput.ts"
import { type AppletOutput } from "./AppletOutput.ts"
import { type AppletSample } from "./AppletSample.ts"
import { type LayoutSetting } from "./LayoutSetting.ts"

export interface ExtensionTool<
  InputFields extends Record<string, any> = any,
  OutputFields extends Record<string, any> = any,
> {
  toolId: string
  name: string
  category: string
  inputFields: Array<AppletInput<InputFields>> | ((inputParams: InputFields) => Array<AppletInput<InputFields>>)
  outputFields: Array<AppletOutput<OutputFields>> | ((outputParams: OutputFields) => Array<AppletOutput<OutputFields>>)
  layoutSetting?: LayoutSetting
  autoRun?: boolean
  samples?: Array<AppletSample<InputFields> | (() => AppletSample<InputFields>)>
  disableMultipleSession?: boolean
  actionFile: string
  dependencies?: {
    external?: string[]
    builtin?: string[]
  }
}
