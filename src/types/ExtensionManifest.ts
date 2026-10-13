/**
 * Parsed `peranti.json`: what the extension is. Its tools are found in
 * `tools/<folder>/peranti.tool.json`, its components in
 * `components/<folder>/peranti.component.json`, and each folder name is the
 * ID, like the extension's own folder name.
 */
export interface ExtensionManifest {
  name: string
  description?: string
  version?: string
  author?: string

  /**
   * Default category of its tools
   */
  category?: string
}
