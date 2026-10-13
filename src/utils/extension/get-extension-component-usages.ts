import { type ExtensionComponentUsage } from "src/types/ExtensionComponentUsage"
import { type InstalledExtension } from "src/types/InstalledExtension"

/**
 * Tool fields of the extension that use `@<componentId>`, as written in their
 * `peranti.tool.json`
 */
export function getExtensionComponentUsages(extension: InstalledExtension, componentId: string): ExtensionComponentUsage[] {
  const name = `@${componentId}`

  return extension.tools.flatMap(({ definition }) => (
    (["input", "output"] as const).flatMap((mode) => {
      const fields: unknown = mode === "input" ? definition.inputFields : definition.outputFields
      if (!Array.isArray(fields)) {
        return []
      }

      return fields
        .filter((field) => field?.component === name)
        .map((field): ExtensionComponentUsage => ({
          toolName: definition.name,
          fieldKey: String(field.key),
          fieldLabel: field.label,
          mode,
          defaultValue: field.defaultValue,
          props: field.props
        }))
    })
  ))
}
