import { type ExtensionRuntime } from "src/enums/extension-runtime"

import { type ExtensionComponentKind } from "./ExtensionComponent.ts"

/**
 * A file of a catalog extension, listed in `index.json` by build-index.mjs
 */
export interface CatalogExtensionFile {
  /**
   * Relative to the extension folder, forward slashes
   */
  path: string
  size: number
  executable?: boolean
}

/**
 * An input or output of a catalog extension, copied from its `peranti.json`
 * by build-index.mjs
 */
export interface CatalogExtensionField {
  key: string
  label?: string
  component: string
}

/**
 * One tool of a catalog extension, as build-index.mjs summarizes it
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
 * One component of a catalog extension, as build-index.mjs summarizes it
 */
export interface CatalogExtensionComponent {
  componentId: string
  name: string
  description?: string
  kind?: ExtensionComponentKind

  /**
   * Its `peranti.component.json`, relative to the extension folder
   */
  path?: string
}

/**
 * An extension listed in a catalog's `index.json`
 */
export interface CatalogIndexEntry {
  /**
   * Folder name in the catalog and once installed: the package ID, or the
   * `toolId` of a single-tool extension
   */
  id: string
  name: string
  description?: string
  version: string
  author?: string
  category?: string

  /**
   * Tools of the extension. Missing in indexes built before packages could
   * hold several tools, `runtime`, `command` and the fields then describe
   * its only tool.
   */
  tools?: CatalogExtensionTool[]
  components?: CatalogExtensionComponent[]
  runtime?: ExtensionRuntime
  command?: string

  /**
   * Folder of the extension inside the catalog
   */
  path: string

  /**
   * Missing in indexes built before file lists were added
   */
  files?: CatalogExtensionFile[]

  /**
   * Missing in indexes built before fields were added
   */
  inputFields?: CatalogExtensionField[]
  outputFields?: CatalogExtensionField[]
}

export interface CatalogIndex {
  schemaVersion: number
  extensions: CatalogIndexEntry[]
}

/**
 * A catalog entry, tagged with the source it was listed by
 */
export interface CatalogExtension extends CatalogIndexEntry {
  sourceId: string
}
