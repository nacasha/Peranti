import { type ExtensionComponentFile } from "./ExtensionComponentFile.ts"
import { type ExtensionFolder } from "./ExtensionStorage.ts"

/**
 * A component of a loaded extension, ready to be drawn
 */
export interface LoadedExtensionComponent extends ExtensionComponentFile {
  /**
   * See `getExtensionComponentKey`
   */
  key: string

  /**
   * Folder of the extension the component belongs to
   */
  extensionFolder: ExtensionFolder

  /**
   * Its HTML with linked scripts and stylesheets inlined
   */
  html: string
}
