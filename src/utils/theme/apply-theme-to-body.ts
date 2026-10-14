import { type ColorScheme } from "src/enums/color-scheme"
import { type ResolvedTheme } from "src/enums/theme-2"

/**
 * Put the resolved theme and color scheme on the body, where the theme
 * stylesheets (styles/themes) pick them up as `body.<theme>[data-color-scheme]`
 */
export function applyThemeToBody(theme: ResolvedTheme, colorScheme: ColorScheme) {
  window.document.body.className = theme
  window.document.body.dataset.colorScheme = colorScheme
}
