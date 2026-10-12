import { type AppletConstructor } from "src/models/AppletConstructor"

import { type ExtensionManifest } from "./ExtensionManifest.ts"
import { type ExtensionSource } from "./ExtensionSource.ts"
import { type ExtensionTool } from "./ExtensionTool.ts"
import { type LoadedExtensionComponent } from "./LoadedExtensionComponent.ts"

export interface InstalledExtensionTool {
  definition: ExtensionTool

  /**
   * Its `peranti.tool.json`, relative to the extension folder
   */
  path: string
  appletConstructor: AppletConstructor
}

/**
 * A folder inside the extensions folder, listed whether or not it loaded
 */
export interface InstalledExtension {
  /**
   * ID of the extension, see `getExtensionId`. Its only tool is registered
   * under it, tools of a package under `<id>/<toolId>`.
   */
  id: string

  /**
   * Key of the catalog source it was installed from, missing for folders
   * added by hand
   */
  sourceKey?: string

  /**
   * Name of the folder, identifies the extension on disk
   */
  folderName: string
  folderPath: string

  /**
   * Parsed `peranti.json`, missing when the file can't be read or parsed
   */
  manifest?: ExtensionManifest

  /**
   * Tools the extension provides, empty when it failed to load. One tool
   * failing to build fails the whole extension.
   */
  tools: InstalledExtensionTool[]

  /**
   * Field components the extension provides to its own tools
   */
  components: LoadedExtensionComponent[]

  /**
   * Why the extension failed to load
   */
  error?: string

  /**
   * Where it was installed from, missing for folders added by hand
   */
  source?: ExtensionSource
}
