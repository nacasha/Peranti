import { AppletType } from "src/enums/applet-type"
import { type AppletActionParams, type AppletFieldErrors } from "src/types/AppletAction"
import { type AppletInput } from "src/types/AppletInput"
import { type AppletOption } from "src/types/AppletOption"
import { type AppletOutput } from "src/types/AppletOutput"
import { type AppletPreset } from "src/types/AppletPreset"
import { type LayoutSetting } from "src/types/LayoutSetting"

type AppletActionResult<OutputFields> = OutputFields & { $errors?: AppletFieldErrors }

export class AppletConstructor<
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
  /**
   * Returns the output values, plus `$errors` to badge fields that have a
   * problem while the outputs still show something useful. The `$errors` form
   * is `NoInfer` so output types are still inferred from the plain values.
   */
  action?: (actionParams: AppletActionParams<InputFields, OptionKeys>) => NoInfer<AppletActionResult<OutputFields>> | Promise<NoInfer<AppletActionResult<OutputFields>>> | OutputFields | Promise<OutputFields> | undefined
  layoutSetting?: LayoutSetting
  autoRun?: boolean
  type?: AppletType
  presets?: Array<AppletPreset<InputFields>>
  metadata?: any
  disableMultipleSession?: boolean
  hideOnSidebar?: boolean
  hasOverriddenDefaultState?: boolean
  options?: Array<AppletOption<OptionKeys>>

  /**
   * Lowercase file extensions (without the dot) this applet is meant to receive
   * from a file drop, e.g. ["json"]. Used to rank tools in the file drop picker.
   * Omitting it means the applet accepts any file it can read as text.
   */
  fileExtensions?: string[]

  constructor(data: AppletConstructor<InputFields, OutputFields, OptionKeys>) {
    this.appletId = data.appletId
    this.name = data.name
    this.category = data.category
    this.inputFields = data.inputFields
    this.outputFields = data.outputFields
    this.action = data.action
    this.layoutSetting = data.layoutSetting
    this.autoRun = data.autoRun
    this.type = data.type ?? AppletType.Tool
    this.presets = data.presets
    this.metadata = data.metadata
    this.disableMultipleSession = data.disableMultipleSession
    this.hideOnSidebar = data.hideOnSidebar
    this.hasOverriddenDefaultState = data.hasOverriddenDefaultState
    this.description = data.description
    this.options = data.options
    this.fileExtensions = data.fileExtensions
  }
}
