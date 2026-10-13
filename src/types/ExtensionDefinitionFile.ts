/**
 * A tool or component definition file found in its folder, see
 * `findExtensionDefinitionFiles`
 */
export interface ExtensionDefinitionFile {
  /**
   * The folder name in kebab case
   */
  id: string

  /**
   * The definition file, relative to the extension folder
   */
  path: string

  /**
   * Folder holding the definition file, relative to the extension folder
   */
  folder: string
}
