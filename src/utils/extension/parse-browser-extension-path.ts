import { BrowserExtensions } from "src/constants/browser-extensions"

/**
 * Folder name and file path of a `browser:/<folderName>/<file>` path, see
 * `BrowserExtensions.pathPrefix`. Undefined for a path on disk.
 */
export function parseBrowserExtensionPath(path: string): { folderName: string, relativePath: string } | undefined {
  if (!path.startsWith(BrowserExtensions.pathPrefix)) {
    return undefined
  }

  const [folderName, ...rest] = path.slice(BrowserExtensions.pathPrefix.length).split("/")
  return { folderName, relativePath: rest.filter(Boolean).join("/") }
}
