import { type CatalogExtensionFile } from "./CatalogExtension.ts"

/**
 * A folder or a file in a tree built from relative paths
 */
export interface FileTreeNode {
  name: string

  /**
   * Full relative path, forward slashes
   */
  path: string

  /**
   * Set for folders
   */
  children?: FileTreeNode[]

  /**
   * Set for files
   */
  file?: CatalogExtensionFile
}
