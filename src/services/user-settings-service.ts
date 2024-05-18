import { makeAutoObservable, reaction } from "mobx"

import { GlobalStyleVariables } from "src/constants/global-style-variables.js"
import { UserSettingsDefault } from "src/enums/user-settings-default.js"
import { UserSettingsKeys } from "src/enums/user-settings-keys"
import { appDataService } from "src/services/app-data-service"

import { globalStyles } from "./global-styles.js"

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

    void appDataService.readUserSettingsFile().then((rawUserSettings) => { this.initialized(rawUserSettings) })
  }

  /**
   * Initialize application preferences based on user settings
   *
   * Default value from each service of watched keys will not be reflected in here,
   * which means the value will be undefined if not exists in `settings.json`
   * @param rawUserSettings
   */
  initialized(rawUserSettings: any) {
    this.values = Object.assign(this.values, rawUserSettings)

    /**
     * Set application theme
     */
    window.document.body.className = (rawUserSettings[UserSettingsKeys.theme] ?? UserSettingsDefault[UserSettingsKeys.theme]).toString()

    /**
     * Set editor font family on load user settings
     */
    globalStyles.setVariable(
      GlobalStyleVariables.editorFontFamily,
      rawUserSettings[UserSettingsKeys.editorFontFamily] ?? UserSettingsDefault[UserSettingsKeys.editorFontFamily]
    )

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
