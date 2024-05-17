import { makeAutoObservable, reaction } from "mobx"

import { UserSettingsKeys } from "src/enums/user-settings-keys"
import { appDataService } from "src/services/app-data-service"

import { globalStyleVariables } from "./global-style-variables.js"

class UserSettingsService {
  /**
   * User settings value
   */
  private values: Record<string, any> = {}

  /**
   * List of watched service / store keys
   */
  private readonly watchedUserSettings: Record<string, Record<string, string>> = {}

  /**
   * Indicates the user settings successfully loaded
   */
  isLoaded: boolean = false

  /**
   * Constructor
   */
  constructor() {
    makeAutoObservable(this)

    void appDataService.readUserSettingsFile().then((u) => { this.initialized(u) })
  }

  /**
   * Initialize application preferences based on user settings
   *
   * @param userSettings
   */
  initialized(userSettings: any) {
    this.values = Object.assign(this.values, userSettings)

    /**
     * Set application theme
     */
    window.document.body.className = (userSettings[UserSettingsKeys.theme] ?? "dark").toString()

    /**
     * Set editor font family on load user settings
     */
    globalStyleVariables.set("--font-family-mono", userSettings[UserSettingsKeys.editorFontFamily])

    this.setIsLoaded(true)
  }

  /**
   * Set is loaded to true so the app can start
   *
   * @param value
   */
  setIsLoaded(value: boolean) {
    this.isLoaded = value
  }

  /**
   * Get user settings value
   *
   * @param settingKey
   * @param defaultValue
   * @returns
   */
  get(settingKey: UserSettingsKeys, defaultValue: any) {
    const userSettingValue = userSettingsService.values[settingKey]
    return userSettingValue ?? defaultValue
  }

  /**
   * Listen to changes value of service / store key
   *
   * @param userSettingKey
   * @returns
   */
  watch(userSettingKey: string) {
    return (target: any, key: any) => {
      if (target) {
        this.watchedUserSettings[target.constructor.name] = {
          ...(this.watchedUserSettings[target.constructor.name] ?? {}),
          [key]: userSettingKey
        }
      }
    }
  }

  /**
   * Listed to store and its keys to persist value into user settings
   *
   * @param store
   */
  watchStore(store: any) {
    const storeName = store.constructor.name
    const watchedKeys = this.watchedUserSettings[storeName]

    if (watchedKeys) {
      Object.entries(watchedKeys).forEach(([storeKey, settingKey]) => {
        reaction(
          () => store[storeKey],
          (value) => {
            void this.updateSetting(settingKey, value)
          }
        )
      })
    }
  }

  /**
   * Make an update to user settings file
   *
   * @param key
   * @param value
   */
  private async updateSetting(key: string, value: string) {
    const settings = await appDataService.readUserSettingsFile()

    if (key && (value !== undefined)) {
      const newSettings = { ...settings, [key]: value }
      void appDataService.writeUserSettingsFile(newSettings)
    }
  }
}

export const userSettingsService = new UserSettingsService()
