/**
 * Media query of the operating system dark color scheme, when supported
 */
export function getDarkSchemeMediaQuery() {
  return typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : undefined
}
