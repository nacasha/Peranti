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

  indexFileName: "index.json",

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

  maxFiles: 200,
  maxTotalBytes: 20 * 1024 * 1024
}
