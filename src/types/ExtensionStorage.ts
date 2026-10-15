import { type CatalogExtensionFile } from "./CatalogExtension.ts"

/**
 * A file to write into an extension folder
 */
export interface ExtensionFileData {
  /**
   * Relative to the extension folder, forward slashes
   */
  path: string
  bytes: Uint8Array

  /**
   * Keeps the executable bit on disk, so a bundled binary can be run directly
   */
  executable?: boolean
}

/**
 * One extension folder, wherever it's kept. Paths are relative to the
 * folder, with forward slashes.
 */
export interface ExtensionFolder {
  /**
   * Folder name, identifies an installed extension
   */
  readonly name: string

  /**
   * Absolute path on this computer, undefined for a folder kept in the browser
   */
  readonly diskPath?: string

  /**
   * Every file, without sizes. Hidden files and `node_modules` are never part
   * of an extension and aren't listed.
   */
  listFilePaths: () => Promise<string[]>

  /**
   * Every file with its size, slower than `listFilePaths` on disk
   */
  listFiles: () => Promise<CatalogExtensionFile[]>

  readBytes: (relativePath: string) => Promise<Uint8Array>
  readText: (relativePath: string) => Promise<string>
}

/**
 * Where installed extensions are kept: the extensions folder on disk in the
 * desktop app, IndexedDB in the browser
 */
export interface ExtensionStorage {
  listFolders: () => Promise<ExtensionFolder[]>

  /**
   * Replaces a folder with `files`. A write that fails partway leaves the
   * folder as it was.
   */
  writeFolder: (folderName: string, files: ExtensionFileData[]) => Promise<void>

  removeFolder: (folderName: string) => Promise<void>

  /**
   * Opens the folder holding every extension in the file manager, where
   * there is one
   */
  revealRoot?: () => Promise<void>
}
