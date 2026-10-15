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
   * Folder of that file, relative to the extension folder. Entry files
   * resolve against it, and executables run inside it.
   */
  folder: string
}
