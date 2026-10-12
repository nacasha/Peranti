import { type CatalogSourceType } from "src/enums/catalog-source-type"

/**
 * A place extensions can be browsed and installed from
 */
export interface CatalogSource {
  id: string
  type: CatalogSourceType

  /**
   * Repo URL, `index.json` URL, or absolute folder path
   */
  location: string

  /**
   * Branch of a repo source, `main` when missing
   */
  branch?: string
}
