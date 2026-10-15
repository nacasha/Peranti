/**
 * Read access to the files of an extension, installed or listed by a
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
}
