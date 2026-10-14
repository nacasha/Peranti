import { type ExtensionRuntime } from "src/enums/extension-runtime"

import { type AppletInput } from "./AppletInput.ts"
import { type AppletOutput } from "./AppletOutput.ts"
import { type AppletSample } from "./AppletSample.ts"
import { type LayoutSetting } from "./LayoutSetting.ts"

/**
 * One tool of an extension, a parsed `peranti.tool.json`
 */
export interface ExtensionTool<
  InputFields extends Record<string, any> = any,
  OutputFields extends Record<string, any> = any,
> {
  /**
   * Its folder name in kebab case, set when it is read: the file has no ID
   */
  toolId: string
  name: string

  /**
   * Falls back to the package's category
   */
  category?: string
  description?: string
  version?: string
  author?: string
  inputFields: Array<AppletInput<InputFields>> | ((inputParams: InputFields) => Array<AppletInput<InputFields>>)
  outputFields: Array<AppletOutput<OutputFields>> | ((outputParams: OutputFields) => Array<AppletOutput<OutputFields>>)
  layoutSetting?: LayoutSetting
  autoRun?: boolean
  samples?: Array<AppletSample<InputFields>>
  disableMultipleSession?: boolean
  runtime: ExtensionRuntime
  javascript?: {
    /**
     * File relative to the tool's folder, its default export receives
     * the input values and returns the output values
     */
    entry: string
  }
  executable?: ExtensionExecutable
}

/**
 * Input values are written to stdin as JSON, output values are read from
 * stdout as JSON
 */
export interface ExtensionExecutable {
  command: string
  args?: string[]
  timeoutMs?: number
}
