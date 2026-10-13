import { readDir } from "@tauri-apps/plugin-fs"

import { fileService } from "src/services/file-service"
import { type ExtensionFolderReader } from "src/types/ExtensionFolderReader"

/**
 * Reads an extension folder on this computer. Hidden files and
 * `node_modules` aren't listed: they're never part of an extension.
 */
export async function createLocalExtensionFolderReader(folderPath: string): Promise<ExtensionFolderReader> {
  const filePaths: string[] = []

  const walk = async(relativeFolder: string) => {
    const absoluteFolder = relativeFolder
      ? await fileService.resolveFilePath(folderPath, ...relativeFolder.split("/"))
      : folderPath

    for (const entry of await readDir(absoluteFolder)) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue
      const relativePath = relativeFolder ? `${relativeFolder}/${entry.name}` : entry.name

      if (entry.isDirectory) {
        await walk(relativePath)
      } else if (entry.isFile) {
        filePaths.push(relativePath)
      }
    }
  }

  await walk("")

  const resolve = async(relativePath: string) => (
    relativePath ? await fileService.resolveFilePath(folderPath, ...relativePath.split("/")) : folderPath
  )

  return {
    filePaths,
    readText: async(relativePath) => await fileService.readFileAsText(await resolve(relativePath)),
    resolveFolder: resolve
  }
}
