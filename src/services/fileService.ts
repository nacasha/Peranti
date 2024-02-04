import { save, open } from "@tauri-apps/api/dialog"
import { BaseDirectory, createDir, exists, readBinaryFile, readDir, readTextFile, writeBinaryFile } from "@tauri-apps/api/fs"
import { appDataDir, resolve } from "@tauri-apps/api/path"
import { invoke } from "@tauri-apps/api/tauri"
import * as base64 from "js-base64"

import { Folders } from "src/constants/folders"
import { removeBase64Header } from "src/utils/base64"

export class FileService {
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

  static async readFileAsBinary(filePath: string) {
    return await readBinaryFile(filePath)
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

  /**
   * Save base64 string into image file
   *
   * @param base64String
   */
  static async saveToImageFile(base64String: string) {
    const filePath = await save({
      filters: [{
        name: "Image",
        extensions: ["png", "jpeg"]
      }]
    })

    if (filePath) {
      await writeBinaryFile(filePath, base64.toUint8Array(removeBase64Header(base64String)))
      await FileService.openPathInFileManager(filePath)
    }
  }

  /**
   * Save base64 string into image file
   *
   * @param textString
   */
  static async saveToTextFile(textString: string) {
    function stringToUint8Array(str: string) {
      const encoder = new TextEncoder()
      return encoder.encode(str)
    }

    const filePath = await save({
      filters: [{
        name: "Text",
        extensions: ["txt"]
      }]
    })

    if (filePath) {
      await writeBinaryFile(filePath, stringToUint8Array(textString))
      await FileService.openPathInFileManager(filePath)
    }
  }

  /**
   * Open OS file manager
   */
  static async openPathInFileManager(path: string) {
    await invoke("reveal_file_manager", { path })
  }

  static async openAndReadFile() {
    const selectedFilePath = await open()

    if (selectedFilePath && !Array.isArray(selectedFilePath)) {
      return await readTextFile(selectedFilePath)
    }
  }
}
