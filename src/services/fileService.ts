import { save } from "@tauri-apps/api/dialog"
import { BaseDirectory, readBinaryFile, readTextFile, writeBinaryFile } from "@tauri-apps/api/fs"
import { resolve } from "@tauri-apps/api/path"
import { invoke } from "@tauri-apps/api/tauri"
import * as base64 from "js-base64"

import { removeBase64Header } from "src/utils/base64"

export class FileService {
  /**
   * Read given file path as text file
   *
   * @param filePath
   * @returns
   */
  static async readFileAsText(filePath: string, appData?: boolean) {
    return await readTextFile(filePath, appData ? { dir: BaseDirectory.AppData } : undefined)
  }

  /**
   * Read given file path as binary file
   *
   * @param filePath
   * @returns
   */
  static async readFileAsBinary(filePath: string, appData?: boolean) {
    return await readBinaryFile(filePath, appData ? { dir: BaseDirectory.AppData } : undefined)
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
}
