import { type CatalogExtensionFile } from "src/types/CatalogExtension"

/**
 * Text that changes whenever a file is added, removed or edited, from the
 * hashes the repo host gives. Undefined when a file has no hash, since a
 * change then can't be told.
 */
export function getCatalogFilesSignature(files: CatalogExtensionFile[] | undefined): string | undefined {
  if (!files || files.some((file) => !file.sha)) {
    return undefined
  }

  return files
    .map((file) => `${file.path}:${file.sha}`)
    .sort()
    .join("\n")
}
