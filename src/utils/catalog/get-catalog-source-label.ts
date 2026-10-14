import { CatalogSourceType } from "src/enums/catalog-source-type"
import { type CatalogSource } from "src/types/CatalogSource"

/**
 * Short name of a catalog source: `owner/repo` for GitHub, host and path for
 * other URLs, and the folder name for a local folder
 */
export function getCatalogSourceLabel(source: CatalogSource): string {
  if (source.type === CatalogSourceType.Local) {
    const folderName = source.location.replace(/[\\/]+$/, "").split(/[\\/]/).pop()
    if (folderName) {
      return folderName
    }
    return source.location
  }

  try {
    const url = new URL(source.location)
    const path = url.pathname.replace(/\/+$/, "").replace(/\.git$/, "").replace(/^\/+/, "")

    if (url.hostname === "github.com") {
      return path
    }

    return `${url.hostname}/${path}`
  } catch {
    return source.location
  }
}
