import { type CatalogIndexEntry } from "./CatalogExtension.ts"

/**
 * What a remote source listed the last time it was read
 */
export interface CachedCatalogSource {
  /**
   * When it was last read from the source, in milliseconds
   */
  updatedAt: number
  extensions: CatalogIndexEntry[]
}

/**
 * Remote sources' listings kept between sessions, by source key, so
 * Discover shows them right away and only checks again once they're old
 */
export type CatalogCache = Record<string, CachedCatalogSource>
