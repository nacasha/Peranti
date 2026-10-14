import { type ExtensionRuntime } from "src/enums/extension-runtime"

import { type ExtensionExecutable } from "./ExtensionTool.ts"

export interface ExtensionMetadata {
  runtime: ExtensionRuntime

  /**
   * Absolute folder of the tool's `peranti.tool.json`, executables run
   * inside it
   */
  folderPath: string

  /**
   * Absolute path of the JavaScript entry file
   */
  entryFile?: string

  executable?: ExtensionExecutable
}
