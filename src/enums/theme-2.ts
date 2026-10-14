export enum Theme {
  Dark = "dark",
  Light = "light",
  System = "system",
}

/**
 * Theme that is actually applied to the interface.
 * `Theme.System` is always resolved into one of these before being used.
 */
export type ResolvedTheme = Theme.Dark | Theme.Light
