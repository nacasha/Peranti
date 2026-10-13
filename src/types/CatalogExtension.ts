import { type ExtensionRuntime } from "src/enums/extension-runtime"

import { type ComponentPropInfo } from "./ComponentPropInfo.ts"
import { type ComponentValueInfo } from "./ComponentValueInfo.ts"
import { type ExtensionComponentKind } from "./ExtensionComponent.ts"

/**
 * A file of a catalog extension, listed by the repo host or the local folder
 */
export interface CatalogExtensionFile {
  /**
   * Relative to the extension folder, forward slashes
   */
  path: string

  /**
   * Missing when the host doesn't give it, as GitLab
   */
  size?: number
  executable?: boolean

  /**
   * Content hash the repo host gives, so an unchanged extension isn't
   * downloaded again on refresh. Missing for local folders.
   */
  sha?: string
}

/**
 * An input or output of a catalog extension tool
 */
export interface CatalogExtensionField {
  key: string
  label?: string
  component: string
}

/**
 * One tool of a catalog extension, summarized from its `peranti.tool.json`
 */
export interface CatalogExtensionTool {
  toolId: string
  name: string
  description?: string
  runtime: ExtensionRuntime

  /**
   * Program an executable tool runs, shown before installing it
   */
  command?: string

  /**
   * Its `peranti.tool.json`, relative to the extension folder
   */
  path?: string
  inputFields?: CatalogExtensionField[]
  outputFields?: CatalogExtensionField[]
}

/**
 * One component of a catalog extension, summarized from its
 * `peranti.component.json`
 */
export interface CatalogExtensionComponent {
  componentId: string
  name: string
  description?: string
  kind?: ExtensionComponentKind
  value?: ComponentValueInfo
  props?: ComponentPropInfo[]

  /**
   * HTML file, relative to its `peranti.component.json`
   */
  entry?: string
  height?: number

  /**
   * Its `peranti.component.json`, relative to the extension folder
   */
  path?: string
}

/**
 * An extension listed by a catalog, read from its files
 */
export interface CatalogIndexEntry {
  /**
   * Folder name in the catalog and once installed, the extension ID
   */
  id: string
  name: string
  description?: string
  version: string
  author?: string
  category?: string

  tools: CatalogExtensionTool[]
  components: CatalogExtensionComponent[]

  /**
   * Folder of the extension inside the catalog
   */
  path: string
  files: CatalogExtensionFile[]
}

/**
 * A catalog entry, tagged with the source it was listed by
 */
export interface CatalogExtension extends CatalogIndexEntry {
  sourceId: string
}
