import { BrowserExtensions } from "src/constants/browser-extensions"

/**
 * Path of a folder or file of an extension kept in the browser, see
 * `BrowserExtensions.pathPrefix`
 */
export function getBrowserExtensionPath(folderName: string, relativePath: string = ""): string {
  const segments = [folderName, ...relativePath.split("/")].filter(Boolean)
  return BrowserExtensions.pathPrefix + segments.join("/")
}
