import { exists, mkdir, readDir, writeTextFile } from "@tauri-apps/plugin-fs"
import localforage from "localforage"

import { FileNames } from "src/constants/file-names.js"
import { Folders } from "src/constants/folders"
import { type UserSettingsKeys } from "src/enums/user-settings-keys.js"
import { isRunningInTauri } from "src/utils/common/is-running-in-tauri.js"
import { getPerantiDataDir } from "src/utils/file/get-peranti-data-dir"

import { fileService } from "./file-service.js"

export const appDataService = {
  browserStore: localforage.createInstance({
    name: "user-settings"
  }),

  async prepareAppDataFolder() {
    if (isRunningInTauri) {
      const baseFolder = await getPerantiDataDir()

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
      const insidePath = await fileService.resolveFilePathInAppData(FileNames.UserSettings)
      void fileService.openPathInFileManager(insidePath)
    }
  },

  async prepareExtensionsFolder() {
    if (isRunningInTauri) {
      await this.prepareAppDataFolder()

      try {
        const extensionsPath = await fileService.resolveFilePathInAppData(Folders.Extensions)

        if (!(await exists(extensionsPath))) {
          await mkdir(extensionsPath)
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
        const settingsPath = await fileService.resolveFilePathInAppData(FileNames.UserSettings)

        if (!(await exists(settingsPath))) {
          await writeTextFile(settingsPath, "{}")
        }
      } catch (err: any) {
        console.log(err)
      }
    }
  },

  async readExtensionsFolder() {
    if (isRunningInTauri) {
      await this.prepareExtensionsFolder()

      return await readDir(await fileService.resolveFilePathInAppData(Folders.Extensions))
    }
  },

  async readUserSettingsFile() {
    if (isRunningInTauri) {
      await this.prepareUserSettingsJSONFile()

      try {
        const userSettingsRaw = await fileService.readFileAsText(
          await fileService.resolveFilePathInAppData(FileNames.UserSettings)
        )
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
        await writeTextFile(
          await fileService.resolveFilePathInAppData(FileNames.UserSettings),
          JSON.stringify(settings, undefined, 2)
        )
      } catch (exception) {
        console.log("Failed to write ".concat(FileNames.UserSettings))
      }
    } else {
      await localforage.setItem("user-settings", settings)
    }
  }
}
