import { type ExtensionComponentFile } from "src/types/ExtensionComponentFile"
import { type ExtensionTool } from "src/types/ExtensionTool"

import { getExtensionComponentKey } from "./get-extension-component-key.js"

/**
 * Point the `"@<componentId>"` fields of a tool at the extension's own
 * components, by their registered key. Throws when a field names a component
 * the extension doesn't have, or uses an input-only one as an output and the
 * other way round.
 */
export function resolveExtensionToolComponents(
  tool: ExtensionTool,
  components: ExtensionComponentFile[],
  extensionId: string
): ExtensionTool {
  const resolveFields = (fields: unknown, mode: "input" | "output") => {
    if (!Array.isArray(fields)) {
      return fields
    }

    return fields.map((field) => {
      const name = field?.component
      if (typeof name !== "string" || !name.startsWith("@")) {
        return field
      }

      const componentId = name.slice(1)
      const component = components.find((item) => item.definition.componentId === componentId)
      if (!component) {
        throw new Error(`${tool.toolId}: field "${field.key}" uses ${name}, which the extension's "components" doesn't list`)
      }

      const kind = component.definition.kind ?? "both"
      if (kind !== "both" && kind !== mode) {
        throw new Error(`${tool.toolId}: ${name} is an ${kind} component, field "${field.key}" is an ${mode}`)
      }

      return { ...field, component: getExtensionComponentKey(extensionId, componentId) }
    })
  }

  return {
    ...tool,
    inputFields: resolveFields(tool.inputFields, "input") as ExtensionTool["inputFields"],
    outputFields: resolveFields(tool.outputFields, "output") as ExtensionTool["outputFields"]
  }
}
