import { AppletType } from "src/enums/applet-type"
import { type AppletActionParams } from "src/types/AppletAction"
import { type AppletInput } from "src/types/AppletInput"
import { type AppletOption } from "src/types/AppletOption"
import { type AppletOutput } from "src/types/AppletOutput"
import { type AppletSample } from "src/types/AppletSample"
import { type LayoutSetting } from "src/types/LayoutSetting"

export class AppletConstructorModel<
  InputFields extends Record<string, any> = any,
  OutputFields extends Record<string, any> = any,
  OptionKeys extends Record<string, any> = any,
> {
  appletId: string
  name: string
  category: string
  description?: string
  inputFields: Array<AppletInput<InputFields>> | ((inputValues: InputFields) => Array<AppletInput<InputFields>>)
  outputFields: Array<AppletOutput<OutputFields>> | ((outputValues: OutputFields) => Array<AppletOutput<OutputFields>>)
  action?: (actionParams: AppletActionParams<InputFields, OptionKeys>) => OutputFields | Promise<OutputFields> | undefined
  layoutSetting?: LayoutSetting
  autoRun?: boolean
  type?: AppletType
  samples?: Array<AppletSample<InputFields>>
  metadata?: any
  disableMultipleSession?: boolean
  hideOnSidebar?: boolean
  hasOverriddenDefaultState?: boolean
  options?: Array<AppletOption<OptionKeys>>

  constructor(data: AppletConstructorModel<InputFields, OutputFields, OptionKeys>) {
    this.appletId = data.appletId
    this.name = data.name
    this.category = data.category
    this.inputFields = data.inputFields
    this.outputFields = data.outputFields
    this.action = data.action
    this.layoutSetting = data.layoutSetting
    this.autoRun = data.autoRun
    this.type = data.type ?? AppletType.Tool
    this.samples = data.samples
    this.metadata = data.metadata
    this.disableMultipleSession = data.disableMultipleSession
    this.hideOnSidebar = data.hideOnSidebar
    this.hasOverriddenDefaultState = data.hasOverriddenDefaultState
    this.description = data.description
    this.options = data.options
  }
}
