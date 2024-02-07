// import { spy } from "mobx"

import { type UserSettingsKeys } from "src/enums/UserSettingsKeys"
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

// spy((event: any) => {
//   const eventConstructorName = event?.object?.constructor?.name ?? ""
//   if (stored[eventConstructorName]) {
//     const aaa = ((event?.debugObjectName ?? "") as string).split(".")
//     const bb = aaa ? aaa[aaa.length - 1] : undefined
//     if (stored[eventConstructorName][event?.name ?? bb]) {
//       console.log("will update local storage", stored[eventConstructorName][event?.name])
//     }
//   }
// })
