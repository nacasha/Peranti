import { makeAutoObservable } from "mobx"

import { UserSettingsKeys } from "src/enums/user-settings-keys"
import { appDataService } from "src/services/app-data-service"

class UserSettingsService {
  values: Record<string, any> = {}

  isLoaded: boolean = false

  constructor() {
    makeAutoObservable(this)

    void appDataService.readSettingsFile().then((userSettings) => {
      this.values = Object.assign(this.values, userSettings)
      window.document.body.className = (userSettings[UserSettingsKeys.theme] ?? "dark").toString()

      this.setIsLoaded(true)
    })
  }

  setIsLoaded(value: boolean) {
    this.isLoaded = value
  }
}

export const userSettingsService = new UserSettingsService()
