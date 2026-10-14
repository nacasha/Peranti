import localforage from "localforage"

import { BrowserExtensions } from "src/constants/browser-extensions"
import { type CatalogExtensionFile } from "src/types/CatalogExtension"

/**
 * A file to write into a browser extension folder
 */
export interface BrowserExtensionFileData {
  path: string
  bytes: Uint8Array
}

/**
 * Listing of one extension folder, written last so a folder only shows once
 * all its files are in
 */
interface BrowserExtensionFolder {
  files: CatalogExtensionFile[]
}

const FOLDER_KEY_PREFIX = "folder:"
const FILE_KEY_PREFIX = "file:"

const getFolderKey = (folderName: string) => FOLDER_KEY_PREFIX + folderName
const getFileKey = (folderName: string, path: string) => `${FILE_KEY_PREFIX}${folderName}/${path}`

/**
 * Extension folders of the browser build, kept in IndexedDB. Each file is
 * one entry, and each folder has one more entry listing its files.
 */
class BrowserExtensionStore {
  private readonly store = localforage.createInstance({ name: BrowserExtensions.storeName })

  /**
   * Names of every stored extension folder
   */
  async listFolderNames() {
    const keys = await this.store.keys()

    return keys
      .filter((key) => key.startsWith(FOLDER_KEY_PREFIX))
      .map((key) => key.slice(FOLDER_KEY_PREFIX.length))
  }

  async listFiles(folderName: string): Promise<CatalogExtensionFile[]> {
    const folder = await this.store.getItem<BrowserExtensionFolder>(getFolderKey(folderName))
    return folder?.files ?? []
  }

  async readBytes(folderName: string, path: string) {
    const bytes = await this.store.getItem<Uint8Array>(getFileKey(folderName, path))

    if (!bytes) {
      throw new Error(`${path} not found`)
    }

    return bytes
  }

  async readText(folderName: string, path: string) {
    return new TextDecoder().decode(await this.readBytes(folderName, path))
  }

  /**
   * Replace a folder with `files`. The listing is written after every file,
   * so a write that fails partway leaves no folder behind.
   */
  async writeFolder(folderName: string, files: BrowserExtensionFileData[]) {
    await this.removeFolder(folderName)

    try {
      for (const file of files) {
        await this.store.setItem(getFileKey(folderName, file.path), file.bytes)
      }

      const folder: BrowserExtensionFolder = {
        files: files.map((file) => ({ path: file.path, size: file.bytes.byteLength }))
      }
      await this.store.setItem(getFolderKey(folderName), folder)
    } catch (exception) {
      await this.removeFolder(folderName).catch(() => {})
      throw exception
    }
  }

  /**
   * Remove a folder, its listing first so it's gone even if a file is left
   */
  async removeFolder(folderName: string) {
    await this.store.removeItem(getFolderKey(folderName))

    const prefix = getFileKey(folderName, "")
    const keys = await this.store.keys()
    await Promise.all(keys
      .filter((key) => key.startsWith(prefix))
      .map(async(key) => { await this.store.removeItem(key) }))
  }
}

export const browserExtensionStore = new BrowserExtensionStore()
