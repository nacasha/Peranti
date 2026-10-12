import { type ExtensionComponent } from "./ExtensionComponent.ts"

/**
 * A component read from the extension's component files, see
 * `readExtensionComponents`
 */
export interface ExtensionComponentFile {
  definition: ExtensionComponent

  /**
   * Its `peranti.component.json`, relative to the extension folder
   */
  path: string

  /**
   * Absolute folder of that file, the entry and its assets resolve against it
   */
  folderPath: string
}
