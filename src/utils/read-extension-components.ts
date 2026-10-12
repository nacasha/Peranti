import { FileNames } from "src/constants/file-names"
import { fileService } from "src/services/file-service"
import { type ExtensionComponent } from "src/types/ExtensionComponent"
import { type ExtensionComponentFile } from "src/types/ExtensionComponentFile"
import { type ExtensionManifest } from "src/types/ExtensionManifest"

import { isSafeRelativePath } from "./is-safe-relative-path.js"

const KINDS = ["input", "output", "both"]

/**
 * Read every `peranti.component.json` a `peranti.json` lists. Throws on the
 * first broken component, naming its file.
 */
export async function readExtensionComponents(
  manifest: ExtensionManifest,
  folderPath: string,
  readText: (absolutePath: string) => Promise<string>
): Promise<ExtensionComponentFile[]> {
  if (manifest.components === undefined) {
    return []
  }

  if (!Array.isArray(manifest.components)) {
    throw new Error(`"components" must be a list of ${FileNames.ExtensionComponentDefinition} files`)
  }

  const seenIds = new Set<string>()
  const components: ExtensionComponentFile[] = []

  for (const [index, componentPath] of manifest.components.entries()) {
    const segments = typeof componentPath === "string" ? componentPath.split("/") : []

    if (!isSafeRelativePath(componentPath) || segments[segments.length - 1] !== FileNames.ExtensionComponentDefinition) {
      throw new Error(`"components[${index}]" must be a path inside the extension ending in ${FileNames.ExtensionComponentDefinition}`)
    }

    let definition: ExtensionComponent
    try {
      definition = JSON.parse(await readText(await fileService.resolveFilePath(folderPath, ...segments)))
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : String(exception)
      throw new Error(`${componentPath}: ${message}`)
    }

    if (!/^[a-z0-9][a-z0-9-]*$/.test(definition?.componentId ?? "")) {
      throw new Error(`${componentPath}: "componentId" must be lowercase letters, digits and dashes`)
    }
    if (seenIds.has(definition.componentId)) {
      throw new Error(`${componentPath}: component ID "${definition.componentId}" is used twice`)
    }
    seenIds.add(definition.componentId)

    if (!definition.entry || !isSafeRelativePath(definition.entry)) {
      throw new Error(`${componentPath}: "entry" must be an HTML file next to it`)
    }
    if (definition.kind !== undefined && !KINDS.includes(definition.kind)) {
      throw new Error(`${componentPath}: "kind" must be one of ${KINDS.join(", ")}`)
    }

    components.push({
      definition: { ...definition, name: definition.name || definition.componentId },
      path: componentPath,
      folderPath: segments.length > 1
        ? await fileService.resolveFilePath(folderPath, ...segments.slice(0, -1))
        : folderPath
    })
  }

  return components
}
