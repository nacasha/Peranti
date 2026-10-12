import { type ExtensionTool } from "./ExtensionTool.ts"

/**
 * Parsed `peranti.json`: what the extension is, and where its tools and
 * components are defined. Each tool lives in its own `peranti.tool.json`,
 * each component in its own `peranti.component.json`.
 *
 * A `peranti.json` with a `toolId` and no `tools` is the older format, the
 * file itself is the extension's only tool. It still loads.
 */
export interface ExtensionManifest extends Partial<ExtensionTool> {
  /**
   * ID of the extension, same as its folder name in a catalog
   */
  id?: string
  name: string
  description?: string
  version?: string
  author?: string

  /**
   * Default category of its tools
   */
  category?: string

  /**
   * Paths of its `peranti.tool.json` files, relative to the extension folder
   */
  tools?: string[]

  /**
   * Paths of its `peranti.component.json` files, relative to the extension
   * folder. Its tools use them as `"component": "@<componentId>"`.
   */
  components?: string[]
}
