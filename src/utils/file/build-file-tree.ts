import { type CatalogExtensionFile } from "src/types/CatalogExtension"
import { type FileTreeNode } from "src/types/FileTreeNode"

const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => nodes
  .sort((a, b) => {
    // Folders before files, then by name
    if (!!a.children !== !!b.children) {
      return a.children ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
  .map((node) => (node.children ? { ...node, children: sortNodes(node.children) } : node))

/**
 * Nest files by the folders in their relative paths, folders first
 */
export function buildFileTree(files: CatalogExtensionFile[]): FileTreeNode[] {
  const root: FileTreeNode[] = []

  files.forEach((file) => {
    const segments = file.path.split("/")
    let level = root

    segments.slice(0, -1).forEach((segment, index) => {
      const path = segments.slice(0, index + 1).join("/")
      let folder = level.find((node) => node.children && node.name === segment)

      if (!folder) {
        folder = { name: segment, path, children: [] }
        level.push(folder)
      }
      level = folder.children!
    })

    level.push({ name: segments[segments.length - 1], path: file.path, file })
  })

  return sortNodes(root)
}
