import { type ResolvedTheme, Theme } from "src/enums/theme-2"

const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)"

function getMediaQuery() {
  return typeof window.matchMedia === "function" ? window.matchMedia(DARK_SCHEME_QUERY) : undefined
}

/**
 * Current operating system color scheme
 */
export function getSystemTheme(): ResolvedTheme {
  return getMediaQuery()?.matches ? Theme.Dark : Theme.Light
}

/**
 * Listen to operating system color scheme changes
 *
 * @returns unsubscribe function
 */
export function watchSystemTheme(onChange: (theme: ResolvedTheme) => void) {
  const mediaQuery = getMediaQuery()
  if (!mediaQuery) return () => {}

  const listener = (event: MediaQueryListEvent) => {
    onChange(event.matches ? Theme.Dark : Theme.Light)
  }

  mediaQuery.addEventListener("change", listener)
  return () => { mediaQuery.removeEventListener("change", listener) }
}

/**
 * Resolve a user theme preference into the theme to actually render
 */
export function resolveTheme(theme: Theme, systemTheme: ResolvedTheme = getSystemTheme()): ResolvedTheme {
  return theme === Theme.System ? systemTheme : theme
}
