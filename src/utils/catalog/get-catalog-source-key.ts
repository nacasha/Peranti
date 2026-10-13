import { CatalogSourceType } from "src/enums/catalog-source-type"
import { type CatalogSource } from "src/types/CatalogSource"

/**
 * Stable name of a catalog source, built from where it points rather than
 * its per-machine ID, so the same catalog gets the same key everywhere:
 * `github.com/owner/repo`, `gitlab.com/group/repo@dev`, `local:/path/to/folder`.
 * Extensions installed from it are identified by this key plus their tool ID.
 */
export function getCatalogSourceKey(source: CatalogSource): string {
  if (source.type === CatalogSourceType.Local) {
    return `local:${source.location.trim().replace(/[\\/]+$/, "")}`
  }

  const url = new URL(source.location.trim())

  const path = url.pathname.replace(/\/+$/, "").replace(/\.git$/, "").replace(/^\/+/, "")
  const key = `${url.hostname.toLowerCase()}/${path}`

  const branch = source.branch?.trim()
  if (branch && branch !== "main") {
    return `${key}@${branch}`
  }

  return key
}
