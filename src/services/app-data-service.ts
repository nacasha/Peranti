import { appDataDir } from "@tauri-apps/api/path"
import { BaseDirectory, mkdir, exists, readDir, writeTextFile } from "@tauri-apps/plugin-fs"

import { FileNames } from "src/constants/file-names.js"
import { Folders } from "src/constants/folders"
import { type UserSettingsKeys } from "src/enums/user-settings-keys.js"

import { fileService } from "./file-service.js"

export const appDataService = {
  async prepareAppDataFolder() {
    const baseFolder = await appDataDir()

    try {
      if (!(await exists(baseFolder))) {
        await mkdir(baseFolder)
      }
    } catch (err: any) {
      console.log(err)
    }
  },

  async openAppDataFolder() {
    const appDataDirPath = await appDataDir()
    const insidePath = await fileService.resolveFilePath(appDataDirPath, FileNames.UserSettings)
    void fileService.openPathInFileManager(insidePath)
  },

  async prepareExtensionsFolder() {
    await this.prepareAppDataFolder()

    try {
      if (!(await exists(Folders.Extensions, { baseDir: BaseDirectory.AppData }))) {
        await mkdir(Folders.Extensions, { baseDir: BaseDirectory.AppData })
      }
    } catch (err: any) {
      console.log(err)
    }
  },

  async prepareUserSettingsJSONFile() {
    try {
      if (!(await exists(FileNames.UserSettings, { baseDir: BaseDirectory.AppData }))) {
        await writeTextFile(FileNames.UserSettings, "{}", { baseDir: BaseDirectory.AppData })
      }
    } catch (err: any) {
      console.log(err)
    }
  },

  async readExtensionsFolder() {
    await this.prepareExtensionsFolder()

    const entries = await readDir(Folders.Extensions, {
      baseDir: BaseDirectory.AppData
    })

    return entries
  },

  async readUserSettingsFile() {
    await this.prepareUserSettingsJSONFile()

    try {
      const userSettingsRaw = await fileService.readFileAsText(FileNames.UserSettings, true)
      return JSON.parse(userSettingsRaw) as Record<UserSettingsKeys, string | number | undefined>
    } catch (exception) {
      return {} as any
    }
  },

  async writeUserSettingsFile(settings: any) {
    await this.prepareUserSettingsJSONFile()

    try {
      await writeTextFile(FileNames.UserSettings, JSON.stringify(settings, undefined, 2), { baseDir: BaseDirectory.AppData })
    } catch (exception) {
      console.log("Failed to write ".concat(FileNames.UserSettings))
    }
  }
}
