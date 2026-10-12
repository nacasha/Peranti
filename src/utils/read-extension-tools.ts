import { FileNames } from "src/constants/file-names"
import { fileService } from "src/services/file-service"
import { type ExtensionManifest } from "src/types/ExtensionManifest"
import { type ExtensionTool } from "src/types/ExtensionTool"
import { type ExtensionToolFile } from "src/types/ExtensionToolFile"

import { isSafeRelativePath } from "./is-safe-relative-path.js"

/**
 * Read every `peranti.tool.json` a `peranti.json` lists, filling in the
 * category, version and author of the extension. An older `peranti.json`
 * that defines its tool itself is returned as the only tool. Throws on the
 * first broken tool, naming its file.
 */
export async function readExtensionTools(
  manifest: ExtensionManifest,
  folderPath: string,
  readText: (absolutePath: string) => Promise<string>
): Promise<ExtensionToolFile[]> {
  if (manifest.tools === undefined) {
    if (!manifest.toolId) {
      throw new Error(`"tools" is required: the paths of its ${FileNames.ExtensionToolDefinition} files`)
    }

    return [{ definition: manifest as ExtensionTool, path: FileNames.ExtensionDefinition, folderPath }]
  }

  if (!Array.isArray(manifest.tools) || manifest.tools.length === 0) {
    throw new Error(`"tools" must list at least one ${FileNames.ExtensionToolDefinition} file`)
  }

  const seenToolIds = new Set<string>()
  const tools: ExtensionToolFile[] = []

  for (const [index, toolPath] of manifest.tools.entries()) {
    const segments = typeof toolPath === "string" ? toolPath.split("/") : []

    if (!isSafeRelativePath(toolPath) || segments[segments.length - 1] !== FileNames.ExtensionToolDefinition) {
      throw new Error(`"tools[${index}]" must be a path inside the extension ending in ${FileNames.ExtensionToolDefinition}`)
    }

    let definition: ExtensionTool
    try {
      definition = JSON.parse(await readText(await fileService.resolveFilePath(folderPath, ...segments)))
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : String(exception)
      throw new Error(`${toolPath}: ${message}`)
    }

    if (!definition?.toolId) {
      throw new Error(`${toolPath}: "toolId" is required`)
    }
    if (definition.toolId.includes("/")) {
      throw new Error(`${toolPath}: "toolId" can't contain "/"`)
    }
    if (seenToolIds.has(definition.toolId)) {
      throw new Error(`${toolPath}: tool ID "${definition.toolId}" is used twice`)
    }
    seenToolIds.add(definition.toolId)

    tools.push({
      definition: {
        ...definition,
        category: definition.category ?? manifest.category,
        version: definition.version ?? manifest.version,
        author: definition.author ?? manifest.author
      },
      path: toolPath,
      folderPath: segments.length > 1
        ? await fileService.resolveFilePath(folderPath, ...segments.slice(0, -1))
        : folderPath
    })
  }

  return tools
}
