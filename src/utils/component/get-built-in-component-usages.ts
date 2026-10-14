import { AppletType } from "src/enums/applet-type"
import { appletStore } from "src/services/applet-store"
import { type ExtensionComponentUsage } from "src/types/ExtensionComponentUsage"

/**
 * Fields of the loaded tools that use a built-in component. Tools whose
 * fields depend on their values are skipped, their list isn't fixed.
 */
export function getBuiltInComponentUsages(name: string): ExtensionComponentUsage[] {
  return appletStore.listOfLoadedApplets
    .filter((applet) => applet.type !== AppletType.Page)
    .flatMap((applet) => (["input", "output"] as const).flatMap((mode) => {
      const fields: unknown = mode === "input" ? applet.inputFields : applet.outputFields
      if (!Array.isArray(fields)) {
        return []
      }

      return fields
        .filter((field) => field?.component === name)
        .map((field): ExtensionComponentUsage => ({
          toolName: applet.name,
          fieldKey: String(field.key),
          fieldLabel: field.label,
          mode,
          defaultValue: field.defaultValue,
          props: field.props
        }))
    }))
}
