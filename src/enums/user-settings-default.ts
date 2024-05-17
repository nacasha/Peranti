import { Theme } from "./theme-2.js"
import { UserSettingsKeys } from "./user-settings-keys.js"

export const UserSettingsDefault = {
  [UserSettingsKeys.theme]: Theme.Dark,
  [UserSettingsKeys.editorFontFamily]: "JetBrains Mono",
  [UserSettingsKeys.editorFontSize]: "13"
}
