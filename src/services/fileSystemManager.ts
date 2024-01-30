import { BaseDirectory, createDir, exists, readDir, readTextFile } from "@tauri-apps/api/fs"
import { appDataDir, resolve } from "@tauri-apps/api/path"

import { Folders } from "src/constants/folders"

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FileSystemManager {
  /**
   * Create extensions folder in user AppData if not exists
   */
  static async createExtensionsFolder() {
    const baseFolder = await appDataDir()

    try {
      if (!(await exists(baseFolder))) {
        await createDir(baseFolder)
      }

      if (!(await exists(Folders.Extensions, { dir: Folders.BaseAppFolder }))) {
        await createDir(Folders.Extensions, { dir: Folders.BaseAppFolder })
      }
    } catch (err: any) {
      console.log(err)
    }
  }

  static async readExtensionsFolder() {
    const entries = await readDir(Folders.Extensions, {
      dir: BaseDirectory.AppData,
      recursive: true
    })

    return entries
  }

  /**
   * Read file as text string
   *
   * @param filePath
   * @returns
   */
  static async readFileAsText(filePath: string) {
    return await readTextFile(filePath)
  }

  /**
   * Return composed string as file path
   *
   * @param paths
   * @returns
   */
  static async resolveFilePath(...paths: string[]) {
    return await resolve(...paths)
  }
}
