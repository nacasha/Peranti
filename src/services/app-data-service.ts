import { BaseDirectory, createDir, exists, readDir, writeTextFile } from "@tauri-apps/api/fs"
import { appDataDir } from "@tauri-apps/api/path"

import { FileNames } from "src/constants/file-names.js"
import { Folders } from "src/constants/folders"
import { type UserSettingsKeys } from "src/enums/user-settings-keys.js"

import { fileService } from "./file-service.js"

class AppDataService {
  async prepareAppDirectory() {
    const baseFolder = await appDataDir()

    try {
      if (!(await exists(baseFolder))) {
        await createDir(baseFolder)
      }
    } catch (err: any) {
      console.log(err)
    }
  }

  async prepareExtensionsFolder() {
    await this.prepareAppDirectory()

    try {
      if (!(await exists(Folders.Extensions, { dir: BaseDirectory.AppData }))) {
        await createDir(Folders.Extensions, { dir: BaseDirectory.AppData })
      }
    } catch (err: any) {
      console.log(err)
    }
  }

  async prepareSettingsJSONFile() {
    try {
      if (!(await exists(FileNames.UserSettings, { dir: BaseDirectory.AppData }))) {
        await writeTextFile(FileNames.UserSettings, "{}", { dir: BaseDirectory.AppData })
      }
    } catch (err: any) {
      console.log(err)
    }
  }

  async readExtensionsFolder() {
    await this.prepareExtensionsFolder()

    const entries = await readDir(Folders.Extensions, {
      dir: BaseDirectory.AppData,
      recursive: true
    })

    return entries
  }

  async readSettingsFile() {
    await this.prepareSettingsJSONFile()

    try {
      const userSettingsRaw = await fileService.readFileAsText(FileNames.UserSettings, true)
      return JSON.parse(userSettingsRaw) as Record<UserSettingsKeys, string | number | undefined>
    } catch (exception) {
      return {} as any
    }
  }

  async writeSettingsFile(settings: any) {
    await this.prepareSettingsJSONFile()

    try {
      await writeTextFile(FileNames.UserSettings, JSON.stringify(settings, undefined, 2), { dir: BaseDirectory.AppData })
    } catch (exception) {
      console.log("Failed to write ".concat(FileNames.UserSettings))
    }
  }

  async openAppDataFolder() {
    const appDataDirPath = await appDataDir()
    const insidePath = await fileService.resolveFilePath(appDataDirPath, FileNames.UserSettings)
    void fileService.openPathInFileManager(insidePath)
  }
}

export const appDataService = new AppDataService()
