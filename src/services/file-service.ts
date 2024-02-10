import { save } from "@tauri-apps/api/dialog"
import { BaseDirectory, readBinaryFile, readTextFile, writeBinaryFile } from "@tauri-apps/api/fs"
import { resolve } from "@tauri-apps/api/path"
import * as base64 from "js-base64"

import { removeBase64Header } from "src/utils/base-64"

import { rustInvokerService } from "./rust-invoker-service.js"

class FileService {
  async readFileAsText(filePath: string, appData?: boolean) {
    return await readTextFile(filePath, appData ? { dir: BaseDirectory.AppData } : undefined)
  }

  async readFileAsBinary(filePath: string, appData?: boolean) {
    return await readBinaryFile(filePath, appData ? { dir: BaseDirectory.AppData } : undefined)
  }

  async resolveFilePath(...paths: string[]) {
    return await resolve(...paths)
  }

  async saveToImageFile(base64String: string) {
    const filePath = await save({
      filters: [{
        name: "Image",
        extensions: ["png", "jpeg"]
      }]
    })

    if (filePath) {
      await writeBinaryFile(filePath, base64.toUint8Array(removeBase64Header(base64String)))
      await this.openPathInFileManager(filePath)
    }
  }

  async saveToTextFile(textString: string) {
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
      await this.openPathInFileManager(filePath)
    }
  }

  async openPathInFileManager(path: string) {
    await rustInvokerService.revealFileManager(path)
  }
}

export const fileService = new FileService()
