import { appDataDir } from "@tauri-apps/api/path"
import { BaseDirectory, mkdir, exists, readDir, writeTextFile } from "@tauri-apps/plugin-fs"
import localforage from "localforage"

import { FileNames } from "src/constants/file-names.js"
import { Folders } from "src/constants/folders"
import { type UserSettingsKeys } from "src/enums/user-settings-keys.js"
import { isRunningInTauri } from "src/utils/is-running-in-tauri.js"

import { fileService } from "./file-service.js"

export const appDataService = {
  browserStore: localforage.createInstance({
    name: "user-settings"
  }),

  async prepareAppDataFolder() {
    if (isRunningInTauri) {
      const baseFolder = await appDataDir()

      try {
        if (!(await exists(baseFolder))) {
          await mkdir(baseFolder)
        }
      } catch (err: any) {
        console.log(err)
      }
    }
  },

  async openAppDataFolder() {
    if (isRunningInTauri) {
      const appDataDirPath = await appDataDir()
      const insidePath = await fileService.resolveFilePath(appDataDirPath, FileNames.UserSettings)
      void fileService.openPathInFileManager(insidePath)
    }
  },

  async prepareExtensionsFolder() {
    if (isRunningInTauri) {
      await this.prepareAppDataFolder()

      try {
        if (!(await exists(Folders.Extensions, { baseDir: BaseDirectory.AppData }))) {
          await mkdir(Folders.Extensions, { baseDir: BaseDirectory.AppData })
        }
      } catch (err: any) {
        console.log(err)
      }
    }
  },

  async prepareUserSettingsJSONFile() {
    if (isRunningInTauri) {
      await this.prepareAppDataFolder()

      try {
        if (!(await exists(FileNames.UserSettings, { baseDir: BaseDirectory.AppData }))) {
          await writeTextFile(FileNames.UserSettings, "{}", { baseDir: BaseDirectory.AppData })
        }
      } catch (err: any) {
        console.log(err)
      }
    }
  },

  async readExtensionsFolder() {
    if (isRunningInTauri) {
      await this.prepareExtensionsFolder()

      const entries = await readDir(Folders.Extensions, {
        baseDir: BaseDirectory.AppData
      })

      return entries
    }
  },

  async readUserSettingsFile() {
    if (isRunningInTauri) {
      await this.prepareUserSettingsJSONFile()

      try {
        const userSettingsRaw = await fileService.readFileAsText(FileNames.UserSettings, true)
        return JSON.parse(userSettingsRaw) as Record<UserSettingsKeys, string | number | undefined>
      } catch (exception) {
        return {} as any
      }
    } else {
      return await localforage.getItem("user-settings") ?? {}
    }
  },

  async writeUserSettingsFile(settings: any) {
    if (isRunningInTauri) {
      await this.prepareUserSettingsJSONFile()

      try {
        await writeTextFile(FileNames.UserSettings, JSON.stringify(settings, undefined, 2), { baseDir: BaseDirectory.AppData })
      } catch (exception) {
        console.log("Failed to write ".concat(FileNames.UserSettings))
      }
    } else {
      await localforage.setItem("user-settings", settings)
    }
  }
}
