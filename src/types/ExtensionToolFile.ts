import { type ExtensionTool } from "./ExtensionTool.ts"

/**
 * A tool read from the extension's tool files, see `readExtensionTools`
 */
export interface ExtensionToolFile {
  definition: ExtensionTool

  /**
   * Its `peranti.tool.json`, relative to the extension folder. The
   * `peranti.json` itself for an extension in the older format.
   */
  path: string

  /**
   * Absolute folder of that file: entry files resolve against it and
   * executables run inside it
   */
  folderPath: string
}
