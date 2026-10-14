import { type ExtensionComponentFile } from "./ExtensionComponentFile.ts"

/**
 * A component of a loaded extension, ready to be drawn
 */
export interface LoadedExtensionComponent extends ExtensionComponentFile {
  /**
   * See `getExtensionComponentKey`
   */
  key: string

  /**
   * Its HTML with linked scripts and stylesheets inlined
   */
  html: string
}
