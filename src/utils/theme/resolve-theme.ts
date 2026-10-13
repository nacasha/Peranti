import { type ResolvedTheme, Theme } from "src/enums/theme-2"
import { getSystemTheme } from "src/utils/theme/get-system-theme"

/**
 * Resolve a user theme preference into the theme to actually render
 */
export function resolveTheme(theme: Theme, systemTheme: ResolvedTheme = getSystemTheme()): ResolvedTheme {
  return theme === Theme.System ? systemTheme : theme
}
