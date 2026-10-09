import { BaseDirectory, exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs"
import localforage from "localforage"
import { makeAutoObservable, runInAction } from "mobx"

import { FileNames } from "src/constants/file-names"
import { type AppletSample } from "src/types/AppletSample"
import { generateRandomString } from "src/utils/generate-random-string"
import { isRunningInTauri } from "src/utils/is-running-in-tauri"

import { appDataService } from "./app-data-service.js"

export interface Snippet extends AppletSample {
  id: string
  appletId: string
  inputValues: Record<string, unknown>
}

const BROWSER_STORAGE_KEY = "snippets"

/**
 * User saved snippets (input values), stored in the app data folder
 */
class SnippetsStore {
  snippets: Snippet[] = []

  constructor() {
    makeAutoObservable(this)
    void this.load()
  }

  getByAppletId(appletId: string) {
    return this.snippets.filter((snippet) => snippet.appletId === appletId)
  }

  add(appletId: string, name: string, inputValues: Record<string, unknown>) {
    this.snippets.push({
      id: generateRandomString(10, "1234567890qwertyuiopasdfghjklzxcvbnm"),
      appletId,
      name,
      // Drops values JSON can't hold (functions, undefined)
      inputValues: JSON.parse(JSON.stringify(inputValues))
    })
    void this.save()
  }

  remove(id: string) {
    this.snippets = this.snippets.filter((snippet) => snippet.id !== id)
    void this.save()
  }

  private async load() {
    try {
      let loaded: Snippet[] = []

      if (isRunningInTauri) {
        if (await exists(FileNames.Snippets, { baseDir: BaseDirectory.AppData })) {
          loaded = JSON.parse(await readTextFile(FileNames.Snippets, { baseDir: BaseDirectory.AppData }))
        }
      } else {
        loaded = await localforage.getItem<Snippet[]>(BROWSER_STORAGE_KEY) ?? []
      }

      runInAction(() => { this.snippets = loaded })
    } catch (exception) {
      console.log("Failed to read ".concat(FileNames.Snippets))
    }
  }

  private async save() {
    const content = JSON.parse(JSON.stringify(this.snippets))

    try {
      if (isRunningInTauri) {
        await appDataService.prepareAppDataFolder()
        await writeTextFile(FileNames.Snippets, JSON.stringify(content, undefined, 2), { baseDir: BaseDirectory.AppData })
      } else {
        await localforage.setItem(BROWSER_STORAGE_KEY, content)
      }
    } catch (exception) {
      console.log("Failed to write ".concat(FileNames.Snippets))
    }
  }
}

export const snippetsStore = new SnippetsStore()
