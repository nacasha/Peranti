/**
 * Written as `peranti-source.json` into an extension installed from a
 * catalog, so updates can be detected. Folders added by hand don't have it.
 */
export interface ExtensionSource {
  /**
   * Label of the catalog, for display
   */
  catalog: string

  /**
   * ID of the catalog source, missing in installs made before sources could
   * be added, which all came from the default catalog
   */
  sourceId?: string

  /**
   * Stable key of the catalog source, see `getCatalogSourceKey`. Missing in
   * installs made before extension IDs were scoped by source.
   */
  sourceKey?: string
  id: string
  version: string
  installedAt: number
}
