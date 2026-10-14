import { CatalogSourceType } from "src/enums/catalog-source-type"
import { type CatalogSource } from "src/types/CatalogSource"

/**
 * Catalog every install starts with. It can be turned off but not removed.
 */
const defaultSource: CatalogSource = {
  id: "default",
  type: CatalogSourceType.GitHub,
  location: "https://github.com/nacasha/peranti-extensions",
  branch: "main"
}

export const ExtensionCatalog = {
  defaultSource,

  /**
   * Catalogs that list extensions in this folder, otherwise at their root
   */
  extensionsFolderName: "extensions",

  /**
   * GitHub's API rejects requests without a user agent
   */
  apiHeaders: {
    "User-Agent": "Peranti",
    Accept: "application/vnd.github+json"
  },

  /**
   * A cached catalog older than this is checked again when it's shown
   */
  cacheMaxAgeMs: 6 * 60 * 60 * 1000,

  maxFiles: 200,
  maxTotalBytes: 20 * 1024 * 1024
}
