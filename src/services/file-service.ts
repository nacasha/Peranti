import { resolve } from "@tauri-apps/api/path"
import { save } from "@tauri-apps/plugin-dialog"
import { readDir, readFile, readTextFile, stat, writeFile } from "@tauri-apps/plugin-fs"
import * as base64 from "js-base64"

import { removeBase64Header } from "src/utils/file/base-64"
import { getPerantiDataDir } from "src/utils/file/get-peranti-data-dir"

import { rustInvokerService } from "./rust-invoker-service.js"

class FileService {
  async readFileAsText(filePath: string) {
    return await readTextFile(filePath)
  }

  async readFileAsBinary(filePath: string) {
    return await readFile(filePath)
  }

  /**
   * Reads size / kind metadata for a path. Returns undefined instead of throwing
   * so callers can degrade to showing just the file name when the path sits
   * outside the fs scope or disappears between the drag and the read.
   */
  async statFile(filePath: string) {
    try {
      const metadata = await stat(filePath)

      return {
        size: metadata.size,
        isDirectory: metadata.isDirectory,
        modifiedAt: metadata.mtime ?? undefined
      }
    } catch (exception) {
      return undefined
    }
  }

  async resolveFilePath(...paths: string[]) {
    return await resolve(...paths)
  }

  async resolveFilePathInAppData(...paths: string[]) {
    return await resolve(await getPerantiDataDir(), ...paths)
  }

  async saveToImageFile(base64String: string) {
    const filePath = await save({
      filters: [{
        name: "Image",
        extensions: ["png", "jpeg"]
      }]
    })

    if (filePath) {
      await writeFile(filePath, base64.toUint8Array(removeBase64Header(base64String)))
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
      await writeFile(filePath, stringToUint8Array(textString))
      await this.openPathInFileManager(filePath)
    }
  }

  async openPathInFileManager(path: string) {
    await rustInvokerService.revealFileManager(path)
  }

  async readDirectoryInAppData(path: string) {
    return await readDir(await this.resolveFilePathInAppData(path))
  }
}

export const fileService = new FileService()
