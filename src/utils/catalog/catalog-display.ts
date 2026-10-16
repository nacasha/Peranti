import { type InstalledExtension } from "src/types/InstalledExtension"
import { formatTimeAgo, TIME_AGO_NOW } from "src/utils/time/format-time-ago"

/**
 * Value of the source picker on the Installed tab for folders added by hand
 */
export const HAND_ADDED_SOURCE_FILTER = "hand-made"

/**
 * When the catalog was last read, such as "Updated 5m ago", or "Updating…"
 * while it's being read again
 */
export function formatCatalogUpdatedLabel(updatedAt: number, isUpdating: boolean, now: number = Date.now()) {
  if (isUpdating) {
    return "Updating…"
  }

  const ago = formatTimeAgo(updatedAt, now)
  return ago === TIME_AGO_NOW ? "Updated just now" : `Updated ${ago} ago`
}

/**
 * Value of the source picker on the Installed tab that lists `extension`
 */
export function getInstalledSourceFilter(extension: InstalledExtension): string {
  return extension.sourceKey ?? HAND_ADDED_SOURCE_FILTER
}
