import { httpRequest } from "src/services/http-client"
import { type ExtensionFolderReader } from "src/types/ExtensionFolderReader"
import { type ExtensionFolder } from "src/types/ExtensionStorage"

import { joinRelativePaths } from "./extension-paths.js"

/**
 * Query that skips the few minutes raw file CDNs cache a file for
 */
const CACHE_BUST_PARAM = "t"

/**
 * Reads an installed extension folder, on disk or in the browser
 *
 * @param filePaths Its files when they're already listed, so they aren't listed again
 */
export async function createExtensionFolderReader(folder: ExtensionFolder, filePaths?: string[]): Promise<ExtensionFolderReader> {
  return {
    filePaths: filePaths ?? await folder.listFilePaths(),
    readText: async(relativePath) => await folder.readText(relativePath)
  }
}

/**
 * Reads an extension folder of a remote catalog through its raw file URLs
 *
 * @param bustCache Skips the CDN cache, to read files changed a moment ago
 */
export function createRemoteExtensionFolderReader(
  baseUrl: string,
  extensionPath: string,
  filePaths: string[],
  bustCache = false
): ExtensionFolderReader {
  return {
    filePaths,
    readText: async(relativePath) => {
      // Appended, not resolved against the base, so a segment like "a:b" can't read as a scheme
      const url = new URL(baseUrl + joinRelativePaths(extensionPath, relativePath).split("/").map(encodeURIComponent).join("/"))
      if (bustCache) {
        url.searchParams.set(CACHE_BUST_PARAM, Date.now().toString())
      }

      const response = await httpRequest(url.href, { method: "GET" })
      if (!response.ok) {
        throw new Error(`Failed to download (HTTP ${response.status})`)
      }

      return new TextDecoder().decode(response.body)
    }
  }
}
