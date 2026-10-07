import { makeAutoObservable, reaction, toJS } from "mobx"

import { CornerRadiusScale } from "src/constants/corner-radius-scale"
import { GlobalStyleVariables } from "src/constants/global-style-variables.js"
import { ToolSidebarItemHeight } from "src/constants/tool-sidebar-item-height"
import { type CardShadow } from "src/enums/card-shadow"
import { type CornerRadius } from "src/enums/corner-radius"
import { type Theme } from "src/enums/theme-2.js"
import { type ToolSidebarDensity } from "src/enums/tool-sidebar-density"
import { UserSettingsDefault } from "src/enums/user-settings-default.js"
import { UserSettingsKeys } from "src/enums/user-settings-keys"
import { appDataService } from "src/services/app-data-service"
import { getCardShadowVariable } from "src/utils/get-card-shadow-variable"
import { resolveTheme } from "src/utils/get-system-theme"

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
     * Set application theme, resolving `Theme.System` against the operating system
     * color scheme so the first paint already matches the final theme
     */
    window.document.body.className = resolveTheme(
      (rawUserSettings[UserSettingsKeys.theme] ?? UserSettingsDefault[UserSettingsKeys.theme]) as Theme
    )

    /**
     * Set editor font family on load user settings
     */
    globalStyles.setVariable(
      GlobalStyleVariables.editorFontFamily,
      rawUserSettings[UserSettingsKeys.editorFontFamily] ?? UserSettingsDefault[UserSettingsKeys.editorFontFamily]
    )

    /**
     * Set interface corner radius and card shadow on load user settings
     */
    const cornerRadius: CornerRadius = rawUserSettings[UserSettingsKeys.cornerRadius] ?? UserSettingsDefault[UserSettingsKeys.cornerRadius]
    globalStyles.setVariable(GlobalStyleVariables.radiusScale, CornerRadiusScale[cornerRadius] ?? "1")

    const cardShadow: CardShadow = rawUserSettings[UserSettingsKeys.cardShadow] ?? UserSettingsDefault[UserSettingsKeys.cardShadow]
    globalStyles.setVariable(GlobalStyleVariables.cardShadow, getCardShadowVariable(cardShadow))

    /**
     * Set tool sidebar item density on load user settings
     */
    const toolSidebarDensity: ToolSidebarDensity = rawUserSettings[UserSettingsKeys.toolSidebarDensity] ?? UserSettingsDefault[UserSettingsKeys.toolSidebarDensity]
    globalStyles.setVariable(GlobalStyleVariables.toolSidebarItemHeight, ToolSidebarItemHeight[toolSidebarDensity] ?? "32px")

    /**
     * Set accent colour on load user settings
     */
    globalStyles.setVariable(
      GlobalStyleVariables.accentColor,
      rawUserSettings[UserSettingsKeys.accentColor] ?? UserSettingsDefault[UserSettingsKeys.accentColor]
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
            // Plain copy: observable arrays/objects are proxies, which the
            // browser's IndexedDB storage can't clone
            void this.updateSetting(settingKey, toJS(value))
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
