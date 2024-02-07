import { spy } from "mobx"

import { type UserSettingsKeys } from "src/enums/UserSettingsKeys"
import { AppDataService } from "src/services/AppDataService"
import { userSettingsStore } from "src/stores/userSettingsStore"

const watchedUserSettings: Record<string, Record<string, string>> = {}

export function getUserSettings(settingKey: UserSettingsKeys, defaultValue: any) {
  const userSettingValue = userSettingsStore.values[settingKey]
  return userSettingValue ?? defaultValue
}

export function watchUserSettings(userSettingKey: string) {
  return function(target: any, key: any) {
    if (target) {
      watchedUserSettings[target.constructor.name] = {
        ...(watchedUserSettings[target.constructor.name] ?? {}),
        [key]: userSettingKey
      }
    }
  }
}

const updateSetting = async(key: string, value: string) => {
  const settings = await AppDataService.readSettingsFile()

  if (key && value) {
    const newSettings = { ...settings, [key]: value }
    void AppDataService.writeSettingsFile(newSettings)
  }
}

spy((event: any) => {
  const eventConstructorName = event?.object?.constructor?.name ?? ""
  const watchedKey = watchedUserSettings[eventConstructorName]

  if (watchedKey) {
    const aaa = ((event?.debugObjectName ?? "") as string).split(".")
    const bb = aaa ? aaa[aaa.length - 1] : undefined
    if (watchedKey[event?.name ?? bb] && event?.type === "update") {
      void updateSetting(watchedKey[event?.name], event?.newValue)
    }
  }
})
