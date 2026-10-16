import { CatalogSourceType } from "src/enums/catalog-source-type"
import { type CatalogSource } from "src/types/CatalogSource"

/**
 * Branch of a repo source that names none
 */
export const DEFAULT_CATALOG_BRANCH = "main"

/**
 * Category of extension tools and pages that name none
 */
export const EXTENSIONS_CATEGORY = "Extensions"

/**
 * Catalog every install starts with. It can be turned off but not removed.
 */
const defaultSource: CatalogSource = {
  id: "default",
  type: CatalogSourceType.GitHub,
  location: "https://github.com/nacasha/peranti-extensions",
  branch: DEFAULT_CATALOG_BRANCH
}

export const ExtensionCatalog = {
  defaultSource,

  /**
   * Catalogs that list extensions in this folder, otherwise at their root
   */
  extensionsFolderName: "extensions",

  /**
   * Version of an extension whose `peranti.json` names none
   */
  unversioned: "0.0.0",

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
