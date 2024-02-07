import { makeAutoObservable } from "mobx"

import { UserSettingsKeys } from "src/enums/UserSettingsKeys"
import { AppDataService } from "src/services/AppDataService"

class UserSettingsStore {
  values: Record<string, any> = {}

  isLoaded: boolean = false

  constructor() {
    void AppDataService.readSettingsFile().then((userSettings) => {
      this.values = Object.assign(this.values, userSettings)
      this.isLoaded = true

      window.document.body.className = (userSettings[UserSettingsKeys.theme] ?? "dark").toString()
    })

    makeAutoObservable(this)
  }
}

export const userSettingsStore = new UserSettingsStore()
