import { type CatalogExtensionField, type CatalogExtensionTool } from "src/types/CatalogExtension"
import { type ExtensionToolFile } from "src/types/ExtensionToolFile"

const summarizeFields = (fields: unknown): CatalogExtensionField[] | undefined => {
  if (!Array.isArray(fields)) {
    return undefined
  }

  return fields.map(({ key, label, component }) => ({ key: String(key), label, component: String(component) }))
}

/**
 * The part of a tool listed in a catalog
 */
export function summarizeExtensionTool({ definition, path }: ExtensionToolFile): CatalogExtensionTool {
  return {
    toolId: definition.toolId,
    name: definition.name || definition.toolId,
    description: definition.description,
    runtime: definition.runtime,
    command: definition.executable?.command,
    path,
    inputFields: summarizeFields(definition.inputFields),
    outputFields: summarizeFields(definition.outputFields)
  }
}
