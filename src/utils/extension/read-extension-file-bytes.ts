import { browserExtensionStore } from "src/services/browser-extension-store"
import { fileService } from "src/services/file-service"

import { parseBrowserExtensionPath } from "./parse-browser-extension-path.js"

/**
 * Bytes of an extension file, on disk or kept in the browser
 */
export async function readExtensionFileBytes(path: string): Promise<Uint8Array> {
  const browserPath = parseBrowserExtensionPath(path)

  if (browserPath) {
    return await browserExtensionStore.readBytes(browserPath.folderName, browserPath.relativePath)
  }

  return await fileService.readFileAsBinary(path)
}
