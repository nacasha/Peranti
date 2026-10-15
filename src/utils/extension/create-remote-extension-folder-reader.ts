import { httpRequest } from "src/services/http-client"
import { type ExtensionFolderReader } from "src/types/ExtensionFolderReader"

/**
 * Reads an extension folder of a remote catalog through its raw file URLs.
 * `bustCache` adds a query to skip the few minutes raw file CDNs cache for.
 */
export function createRemoteExtensionFolderReader(
  baseUrl: string,
  extensionPath: string,
  filePaths: string[],
  bustCache = false
): ExtensionFolderReader {
  const resolve = (relativePath: string) => {
    const segments = [...extensionPath.split("/"), ...relativePath.split("/")].filter(Boolean)
    return baseUrl + segments.map(encodeURIComponent).join("/")
  }

  return {
    filePaths,
    readText: async(relativePath) => {
      const url = resolve(relativePath)
      const response = await httpRequest(bustCache ? `${url}?t=${Date.now()}` : url, { method: "GET" })

      if (!response.ok) {
        throw new Error(`Failed to download (HTTP ${response.status})`)
      }

      return new TextDecoder().decode(response.body)
    }
  }
}
