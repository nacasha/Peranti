import { ExtensionRuntime } from "src/enums/extension-runtime"
import { type CatalogExtensionTool, type CatalogIndexEntry } from "src/types/CatalogExtension"

/**
 * Tools of a catalog entry. An entry from an older index describes its only
 * tool with its own `runtime`, `command` and fields.
 */
export function getCatalogEntryTools(entry: CatalogIndexEntry): CatalogExtensionTool[] {
  if (entry.tools && entry.tools.length > 0) {
    return entry.tools
  }

  return [{
    toolId: entry.id,
    name: entry.name,
    description: entry.description,
    runtime: entry.runtime ?? ExtensionRuntime.JavaScript,
    command: entry.command,
    inputFields: entry.inputFields,
    outputFields: entry.outputFields
  }]
}
