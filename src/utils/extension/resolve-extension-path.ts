import { fileService } from "src/services/file-service"

import { getBrowserExtensionPath } from "./get-browser-extension-path.js"
import { parseBrowserExtensionPath } from "./parse-browser-extension-path.js"

/**
 * `relativePath` inside an extension folder, on disk or kept in the browser
 */
export async function resolveExtensionPath(folderPath: string, relativePath: string): Promise<string> {
  const browserPath = parseBrowserExtensionPath(folderPath)

  if (browserPath) {
    return getBrowserExtensionPath(browserPath.folderName, `${browserPath.relativePath}/${relativePath}`)
  }

  return await fileService.resolveFilePath(folderPath, ...relativePath.split("/"))
}
