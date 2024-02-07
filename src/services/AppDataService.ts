import { BaseDirectory, createDir, exists, readDir, writeTextFile } from "@tauri-apps/api/fs"
import { appDataDir } from "@tauri-apps/api/path"

import { Folders } from "src/constants/folders"
import { type UserSettingsKeys } from "src/enums/UserSettingsKeys.js"

import { FileService } from "./fileService.js"

export class AppDataService {
  static async prepareAppDirectory() {
    const baseFolder = await appDataDir()

    try {
      if (!(await exists(baseFolder))) {
        await createDir(baseFolder)
      }
    } catch (err: any) {
      console.log(err)
    }
  }

  static async prepareExtensionsFolder() {
    await AppDataService.prepareAppDirectory()

    try {
      if (!(await exists(Folders.Extensions, { dir: BaseDirectory.AppData }))) {
        await createDir(Folders.Extensions, { dir: BaseDirectory.AppData })
      }
    } catch (err: any) {
      console.log(err)
    }
  }

  static async prepareSettingsJSONFile() {
    try {
      if (!(await exists("settings.json", { dir: BaseDirectory.AppData }))) {
        await writeTextFile("settings.json", "{}", { dir: BaseDirectory.AppData })
      }
    } catch (err: any) {
      console.log(err)
    }
  }

  static async readExtensionsFolder() {
    await AppDataService.prepareExtensionsFolder()

    const entries = await readDir(Folders.Extensions, {
      dir: BaseDirectory.AppData,
      recursive: true
    })

    return entries
  }

  static async readSettingsFile() {
    await AppDataService.prepareSettingsJSONFile()

    try {
      const userSettingsRaw = await FileService.readFileAsText("settings.json", true)
      return JSON.parse(userSettingsRaw) as Record<UserSettingsKeys, string | number | undefined>
    } catch (exception) {
      return {} as any
    }
  }

  static async writeSettingsFile(settings: any) {
    await AppDataService.prepareSettingsJSONFile()

    try {
      await writeTextFile("settings.json", JSON.stringify(settings, undefined, 2), { dir: BaseDirectory.AppData })
    } catch (exception) {
      console.log("Failed to write settings.json")
    }
  }
}
