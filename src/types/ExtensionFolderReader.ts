/**
 * Read access to an extension folder, on this computer or in a remote
 * catalog, so both are read the same way
 */
export interface ExtensionFolderReader {
  /**
   * Every file, relative to the extension folder, forward slashes
   */
  filePaths: string[]

  /**
   * Text of a file, by its path relative to the extension folder
   */
  readText: (relativePath: string) => Promise<string>

  /**
   * Absolute path or URL of a folder, by its path relative to the extension
   * folder. An empty path is the extension folder itself.
   */
  resolveFolder: (relativePath: string) => Promise<string>
}
