import { exists, mkdir, readDir, remove, rename, stat, writeFile } from "@tauri-apps/plugin-fs"

import { Folders } from "src/constants/folders"
import { appDataService } from "src/services/app-data-service"
import { fileService } from "src/services/file-service"
import { type CatalogExtensionFile } from "src/types/CatalogExtension"
import { type ExtensionFileData, type ExtensionFolder, type ExtensionStorage } from "src/types/ExtensionStorage"

/**
 * Never part of an extension. Hidden entries also can't be read or written:
 * the fs scope's `**` doesn't match them on Unix.
 */
const IGNORED_ENTRY_NAMES = new Set(["node_modules"])

const FILE_MODE = 0o644
const EXECUTABLE_FILE_MODE = 0o755
const EXECUTABLE_BITS = 0o111

export function isIgnoredEntry(name: string) {
  return name.startsWith(".") || IGNORED_ENTRY_NAMES.has(name)
}

const toSegments = (relativePath: string) => relativePath.split("/").filter(Boolean)

/**
 * Absolute path of `relativePath` inside a folder on disk
 */
export async function resolveDiskPath(folderPath: string, relativePath: string = "") {
  const segments = toSegments(relativePath)
  return segments.length > 0 ? await fileService.resolveFilePath(folderPath, ...segments) : folderPath
}

/**
 * An extension folder on this computer: in the extensions folder, or in a
 * local source it's loaded from in place
 */
export class DiskExtensionFolder implements ExtensionFolder {
  constructor(
    readonly name: string,
    readonly diskPath: string
  ) {}

  /**
   * Every file below the folder, depth first, relative to it
   */
  private async walk(relativeFolder = ""): Promise<string[]> {
    const entries = await readDir(await resolveDiskPath(this.diskPath, relativeFolder))
    const paths: string[] = []

    for (const entry of entries) {
      if (isIgnoredEntry(entry.name)) continue

      const relativePath = relativeFolder ? `${relativeFolder}/${entry.name}` : entry.name
      if (entry.isDirectory) {
        paths.push(...await this.walk(relativePath))
      } else if (entry.isFile) {
        paths.push(relativePath)
      }
    }

    return paths
  }

  async listFilePaths() {
    return await this.walk()
  }

  async listFiles(): Promise<CatalogExtensionFile[]> {
    return await Promise.all((await this.walk()).map(async(path) => {
      const info = await stat(await resolveDiskPath(this.diskPath, path))
      return {
        path,
        size: info.size,
        executable: info.mode !== null && (info.mode & EXECUTABLE_BITS) !== 0
      }
    }))
  }

  async readBytes(relativePath: string) {
    return await fileService.readFileAsBinary(await resolveDiskPath(this.diskPath, relativePath))
  }

  async readText(relativePath: string) {
    return await fileService.readFileAsText(await resolveDiskPath(this.diskPath, relativePath))
  }
}

/**
 * Extensions in the extensions folder of the app data folder
 */
export class DiskExtensionStorage implements ExtensionStorage {
  private async getRootPath() {
    await appDataService.prepareExtensionsFolder()
    return await fileService.resolveFilePathInAppData(Folders.Extensions)
  }

  async listFolders(): Promise<ExtensionFolder[]> {
    const rootPath = await this.getRootPath()
    const entries = await readDir(rootPath)

    return await Promise.all(entries
      .filter((entry) => entry.isDirectory && !isIgnoredEntry(entry.name))
      .map(async(entry) => new DiskExtensionFolder(entry.name, await resolveDiskPath(rootPath, entry.name))))
  }

  /**
   * Files are written into a staging folder, then moved into place, so a
   * failure never leaves a half-written extension behind
   */
  async writeFolder(folderName: string, files: ExtensionFileData[]) {
    const targetPath = await resolveDiskPath(await this.getRootPath(), folderName)
    const stagingPath = await fileService.resolveFilePathInAppData(Folders.ExtensionInstalls, folderName)

    await this.removeIfExists(stagingPath)
    await mkdir(stagingPath, { recursive: true })

    try {
      for (const file of files) {
        const segments = toSegments(file.path)
        if (segments.length > 1) {
          await mkdir(await resolveDiskPath(stagingPath, segments.slice(0, -1).join("/")), { recursive: true })
        }

        await writeFile(await resolveDiskPath(stagingPath, file.path), file.bytes, {
          mode: file.executable ? EXECUTABLE_FILE_MODE : FILE_MODE
        })
      }

      await this.removeIfExists(targetPath)
      await rename(stagingPath, targetPath)
    } catch (exception) {
      await remove(stagingPath, { recursive: true }).catch(() => {})
      throw exception
    }
  }

  async removeFolder(folderName: string) {
    await remove(await resolveDiskPath(await this.getRootPath(), folderName), { recursive: true })
  }

  async revealRoot() {
    await fileService.openPathInFileManager(await this.getRootPath())
  }

  private async removeIfExists(path: string) {
    if (await exists(path)) {
      await remove(path, { recursive: true })
    }
  }
}
