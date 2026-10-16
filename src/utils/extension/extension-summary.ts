import { FieldModes } from "src/constants/extension-component-kinds"
import { ExtensionRuntimeLabels } from "src/constants/extension-runtime-labels"
import { ExtensionPlatform } from "src/enums/extension-platform"
import { ExtensionRuntime } from "src/enums/extension-runtime"
import { type CatalogExtensionField, type CatalogExtensionTool } from "src/types/CatalogExtension"
import { type ExtensionComponentMode } from "src/types/ExtensionComponentMessage"
import { type ExtensionComponentUsage } from "src/types/ExtensionComponentUsage"
import { type ExtensionTool } from "src/types/ExtensionTool"
import { type ExtensionToolFile } from "src/types/ExtensionToolFile"
import { type InstalledExtension } from "src/types/InstalledExtension"
import { pluralize } from "src/utils/text/pluralize"

import { toComponentReference } from "./extension-ids.js"

/**
 * What an extension provides and runs, summarized for display and for
 * catalog listings
 */

const getFields = (tool: ExtensionTool, mode: ExtensionComponentMode): unknown => (
  mode === "input" ? tool.inputFields : tool.outputFields
)

/**
 * What an extension provides, as badge labels: "1 Tool", "3 Tools",
 * "2 Components". Empty kinds are left out.
 */
export function getExtensionProvidesLabels(toolCount: number, componentCount: number): string[] {
  return [
    toolCount > 0 && pluralize(toolCount, "Tool"),
    componentCount > 0 && pluralize(componentCount, "Component")
  ].filter((label): label is string => typeof label === "string")
}

/**
 * Where an extension with tools of these runtimes can run: the browser too
 * unless one of them runs a program. Undefined without tools, such as an
 * extension that failed to load.
 */
export function getExtensionPlatform(runtimes: Array<ExtensionRuntime | undefined>): ExtensionPlatform | undefined {
  if (runtimes.length === 0) {
    return undefined
  }

  return runtimes.includes(ExtensionRuntime.Executable) ? ExtensionPlatform.Desktop : ExtensionPlatform.Web
}

/**
 * Runtimes of an extension's tools, each listed once: "JavaScript", or
 * "JavaScript, Executable" for a mixed package
 */
export function getRuntimeSummary(runtimes: Array<ExtensionRuntime | undefined>): string | undefined {
  const labels = [...new Set(runtimes)]
    .filter((runtime): runtime is ExtensionRuntime => !!runtime && runtime in ExtensionRuntimeLabels)
    .map((runtime) => ExtensionRuntimeLabels[runtime])

  return labels.length > 0 ? labels.join(", ") : undefined
}

/**
 * What a tool runs: the command line of an executable tool, or the entry
 * file of a JavaScript one
 */
export function getExtensionToolRuns(tool: ExtensionTool): string | undefined {
  if (tool.runtime === ExtensionRuntime.Executable) {
    return [tool.executable?.command, ...(tool.executable?.args ?? [])].filter(Boolean).join(" ") || undefined
  }

  return tool.javascript?.entry
}

/**
 * Tool fields of the extension that use `@<componentId>`, as written in their
 * `peranti.tool.json`
 */
export function getExtensionComponentUsages(extension: InstalledExtension, componentId: string): ExtensionComponentUsage[] {
  const reference = toComponentReference(componentId)

  return extension.tools.flatMap(({ definition }) => FieldModes.flatMap((mode) => {
    const fields = getFields(definition, mode)
    if (!Array.isArray(fields)) {
      return []
    }

    return fields
      .filter((field) => field?.component === reference)
      .map((field): ExtensionComponentUsage => ({
        toolName: definition.name,
        fieldKey: String(field.key),
        fieldLabel: field.label,
        mode,
        defaultValue: field.defaultValue,
        props: field.props
      }))
  }))
}

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
    inputFields: summarizeFields(getFields(definition, "input")),
    outputFields: summarizeFields(getFields(definition, "output"))
  }
}
