import { DefaultAccentColor } from "src/constants/accent-colors"

import { CardShadow } from "./card-shadow.js"
import { CornerRadius } from "./corner-radius.js"
import { Theme } from "./theme-2.js"
import { ToolSidebarDensity } from "./tool-sidebar-density.js"
import { UserSettingsKeys } from "./user-settings-keys.js"

export const UserSettingsDefault = {
  [UserSettingsKeys.theme]: Theme.Dark,
  [UserSettingsKeys.editorFontFamily]: "JetBrains Mono",
  [UserSettingsKeys.editorFontSize]: "13",
  [UserSettingsKeys.cornerRadius]: CornerRadius.Default,
  [UserSettingsKeys.cardShadow]: CardShadow.Subtle,
  [UserSettingsKeys.accentColor]: DefaultAccentColor,
  [UserSettingsKeys.toolSidebarDensity]: ToolSidebarDensity.Default
}
