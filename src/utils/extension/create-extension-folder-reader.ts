import { type ExtensionFolderReader } from "src/types/ExtensionFolderReader"
import { type ExtensionFolder } from "src/types/ExtensionStorage"

/**
 * Reads an extension folder the way the definition readers expect
 *
 * @param filePaths Its files when they're already listed, so they aren't listed again
 */
export async function createExtensionFolderReader(folder: ExtensionFolder, filePaths?: string[]): Promise<ExtensionFolderReader> {
  return {
    filePaths: filePaths ?? await folder.listFilePaths(),
    readText: async(relativePath) => await folder.readText(relativePath)
  }
}
