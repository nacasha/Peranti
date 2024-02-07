import { BaseDirectory, createDir, exists, readDir, writeTextFile } from "@tauri-apps/api/fs"
import { appDataDir } from "@tauri-apps/api/path"

import { FileNames } from "src/constants/file-names.js"
import { Folders } from "src/constants/folders"
import { type UserSettingsKeys } from "src/enums/user-settings-keys.js"

import { FileService } from "./file-service.js"

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
      if (!(await exists(FileNames.UserSettings, { dir: BaseDirectory.AppData }))) {
        await writeTextFile(FileNames.UserSettings, "{}", { dir: BaseDirectory.AppData })
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
      const userSettingsRaw = await FileService.readFileAsText(FileNames.UserSettings, true)
      return JSON.parse(userSettingsRaw) as Record<UserSettingsKeys, string | number | undefined>
    } catch (exception) {
      return {} as any
    }
  }

  static async writeSettingsFile(settings: any) {
    await AppDataService.prepareSettingsJSONFile()

    try {
      await writeTextFile(FileNames.UserSettings, JSON.stringify(settings, undefined, 2), { dir: BaseDirectory.AppData })
    } catch (exception) {
      console.log("Failed to write ".concat(FileNames.UserSettings))
    }
  }
}
