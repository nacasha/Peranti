import { browserExtensionStore } from "src/services/browser-extension-store"
import { type ExtensionFolderReader } from "src/types/ExtensionFolderReader"

import { getBrowserExtensionPath } from "./get-browser-extension-path.js"

/**
 * Reads an extension folder kept in the browser's storage
 */
export async function createBrowserExtensionFolderReader(folderName: string): Promise<ExtensionFolderReader> {
  const files = await browserExtensionStore.listFiles(folderName)

  return {
    filePaths: files.map((file) => file.path),
    readText: async(relativePath) => await browserExtensionStore.readText(folderName, relativePath),
    resolveFolder: async(relativePath) => getBrowserExtensionPath(folderName, relativePath)
  }
}
