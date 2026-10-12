import { type ResolvedTheme } from "src/enums/theme-2"

/**
 * Theme sent into an extension component frame
 */
export interface ExtensionComponentTheme {
  name: ResolvedTheme
  variables: Record<string, string>
}
