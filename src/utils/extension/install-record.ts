import { FileNames } from "src/constants/file-names"
import { type CatalogExtensionFile } from "src/types/CatalogExtension"

/**
 * Whether a file is the record Peranti writes into an extension it installs,
 * see `ExtensionSource`. It isn't one of the extension's own files.
 */
export function isInstallRecord(path: string) {
  return path === FileNames.ExtensionSource
}

/**
 * The extension's own files, without the install record
 */
export function withoutInstallRecord<T extends Pick<CatalogExtensionFile, "path">>(files: T[]): T[] {
  return files.filter((file) => !isInstallRecord(file.path))
}
