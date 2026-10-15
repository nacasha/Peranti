import localforage from "localforage"

import { BrowserExtensions } from "src/constants/browser-extensions"
import { type CatalogExtensionFile } from "src/types/CatalogExtension"
import { type ExtensionFileData, type ExtensionFolder, type ExtensionStorage } from "src/types/ExtensionStorage"

/**
 * Listing of one folder. Written after all its files, so a folder only
 * exists once every file is in.
 */
interface StoredFolder {
  files: CatalogExtensionFile[]

  /**
   * Tells the files of one write apart from the files of the one before, so a
   * folder is replaced only once all the new files are in. Missing for
   * folders written before generations existed.
   */
  generation?: string
}

const FOLDER_KEY_PREFIX = "folder:"
const FILE_KEY_PREFIX = "file:"
const GENERATION_SEPARATOR = "@"

const store = localforage.createInstance({ name: BrowserExtensions.storeName })

const getFolderKey = (folderName: string) => FOLDER_KEY_PREFIX + folderName

/**
 * Prefix of every file key of one generation of a folder
 */
const getFilesPrefix = (folderName: string, generation?: string) => (
  generation === undefined
    ? `${FILE_KEY_PREFIX}${folderName}/`
    : `${FILE_KEY_PREFIX}${folderName}${GENERATION_SEPARATOR}${generation}/`
)

const createGeneration = () => Date.now().toString(36)

async function removeKeysStartingWith(prefix: string) {
  const keys = await store.keys()
  await Promise.all(keys.filter((key) => key.startsWith(prefix)).map(async(key) => { await store.removeItem(key) }))
}

/**
 * An extension folder kept in IndexedDB: one entry per file, and one more
 * listing them
 */
class BrowserExtensionFolder implements ExtensionFolder {
  readonly diskPath = undefined

  constructor(
    readonly name: string,
    private readonly stored: StoredFolder
  ) {}

  async listFilePaths() {
    return this.stored.files.map((file) => file.path)
  }

  async listFiles() {
    return this.stored.files
  }

  async readBytes(relativePath: string) {
    const bytes = await store.getItem<Uint8Array>(getFilesPrefix(this.name, this.stored.generation) + relativePath)
    if (!bytes) {
      throw new Error(`${relativePath} not found`)
    }

    return bytes
  }

  async readText(relativePath: string) {
    return new TextDecoder().decode(await this.readBytes(relativePath))
  }
}

/**
 * Extensions installed by the browser build, which has no extensions folder
 */
export class BrowserExtensionStorage implements ExtensionStorage {
  async listFolders(): Promise<ExtensionFolder[]> {
    const folderNames = (await store.keys())
      .filter((key) => key.startsWith(FOLDER_KEY_PREFIX))
      .map((key) => key.slice(FOLDER_KEY_PREFIX.length))

    const folders = await Promise.all(folderNames.map(async(folderName) => {
      const stored = await store.getItem<StoredFolder>(getFolderKey(folderName))
      return stored ? new BrowserExtensionFolder(folderName, stored) : undefined
    }))

    return folders.filter((folder): folder is BrowserExtensionFolder => folder !== undefined)
  }

  /**
   * Writes the files under a new generation, then points the listing at it.
   * The previous files are only removed once the new listing is saved.
   */
  async writeFolder(folderName: string, files: ExtensionFileData[]) {
    const previous = await store.getItem<StoredFolder>(getFolderKey(folderName))
    const generation = createGeneration()
    const filesPrefix = getFilesPrefix(folderName, generation)

    try {
      for (const file of files) {
        await store.setItem(filesPrefix + file.path, file.bytes)
      }

      const stored: StoredFolder = {
        generation,
        files: files.map((file) => ({ path: file.path, size: file.bytes.byteLength, executable: file.executable }))
      }
      await store.setItem(getFolderKey(folderName), stored)
    } catch (exception) {
      await removeKeysStartingWith(filesPrefix).catch(() => {})
      throw exception
    }

    if (previous) {
      await removeKeysStartingWith(getFilesPrefix(folderName, previous.generation)).catch(() => {})
    }
  }

  /**
   * Removes the listing first, so the folder is gone even if a file is left
   */
  async removeFolder(folderName: string) {
    const stored = await store.getItem<StoredFolder>(getFolderKey(folderName))
    await store.removeItem(getFolderKey(folderName))

    if (stored) {
      await removeKeysStartingWith(getFilesPrefix(folderName, stored.generation))
    }
  }
}
