import { type ExtensionRuntime } from "src/enums/extension-runtime"

import { type ExtensionFolder } from "./ExtensionStorage.ts"
import { type ExtensionExecutable } from "./ExtensionTool.ts"

/**
 * What an extension tool needs to run, see `runExtension`
 */
export interface ExtensionMetadata {
  runtime: ExtensionRuntime

  /**
   * The extension's folder, its entry file is read from it
   */
  folder: ExtensionFolder

  /**
   * JavaScript entry file, relative to the extension folder
   */
  entryFile?: string

  /**
   * Absolute folder of the tool's `peranti.tool.json`, executables run inside it
   */
  workingDirectory?: string

  executable?: ExtensionExecutable
}
