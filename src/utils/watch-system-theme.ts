import { type ResolvedTheme, Theme } from "src/enums/theme-2"
import { getDarkSchemeMediaQuery } from "src/utils/get-dark-scheme-media-query"

/**
 * Listen to operating system color scheme changes
 *
 * @returns unsubscribe function
 */
export function watchSystemTheme(onChange: (theme: ResolvedTheme) => void) {
  const mediaQuery = getDarkSchemeMediaQuery()
  if (!mediaQuery) return () => {}

  const listener = (event: MediaQueryListEvent) => {
    onChange(event.matches ? Theme.Dark : Theme.Light)
  }

  mediaQuery.addEventListener("change", listener)
  return () => { mediaQuery.removeEventListener("change", listener) }
}
