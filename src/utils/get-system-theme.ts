import { type ResolvedTheme, Theme } from "src/enums/theme-2"
import { getDarkSchemeMediaQuery } from "src/utils/get-dark-scheme-media-query"

/**
 * Current operating system color scheme
 */
export function getSystemTheme(): ResolvedTheme {
  return getDarkSchemeMediaQuery()?.matches ? Theme.Dark : Theme.Light
}
