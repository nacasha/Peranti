import { formatTimeAgo } from "../time/format-time-ago.js"

/**
 * When the catalog was last read, such as "Updated 5m ago", or "Updating…"
 * while it's being read again
 */
export function formatCatalogUpdatedLabel(updatedAt: number, isUpdating: boolean, now: number = Date.now()) {
  if (isUpdating) {
    return "Updating…"
  }

  const ago = formatTimeAgo(updatedAt, now)
  return ago === "now" ? "Updated just now" : `Updated ${ago} ago`
}
