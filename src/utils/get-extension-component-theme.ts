import { ExtensionComponentThemeVariables } from "src/constants/extension-component-theme-variables"
import { type ResolvedTheme } from "src/enums/theme-2"
import { type ExtensionComponentTheme } from "src/types/ExtensionComponentTheme"

/**
 * Current values of the theme variables, read from the page as it is drawn
 */
export function getExtensionComponentTheme(name: ResolvedTheme): ExtensionComponentTheme {
  const style = getComputedStyle(document.body)
  const variables: Record<string, string> = {}

  ExtensionComponentThemeVariables.forEach((variable) => {
    const value = style.getPropertyValue(variable).trim()
    if (value) {
      variables[variable] = value
    }
  })

  return { name, variables }
}
