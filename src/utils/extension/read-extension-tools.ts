import { FileNames } from "src/constants/file-names"
import { type ExtensionFolderReader } from "src/types/ExtensionFolderReader"
import { type ExtensionManifest } from "src/types/ExtensionManifest"
import { type ExtensionTool } from "src/types/ExtensionTool"
import { type ExtensionToolFile } from "src/types/ExtensionToolFile"
import { getErrorMessage } from "src/utils/common/get-error-message"

import { findExtensionDefinitionFiles } from "./find-extension-definition-files.js"

/**
 * Read every `tools/<folder>/peranti.tool.json` of an extension, filling in
 * the category, version and author of the extension. The folder name in
 * kebab case is the tool ID. Throws on the first broken tool, naming its file.
 */
export async function readExtensionTools(
  manifest: ExtensionManifest,
  folder: ExtensionFolderReader
): Promise<ExtensionToolFile[]> {
  const files = findExtensionDefinitionFiles(folder.filePaths, "tools", FileNames.ExtensionToolDefinition)

  if (files.length === 0) {
    throw new Error(`No tools: add a folder in "tools" with a ${FileNames.ExtensionToolDefinition}`)
  }

  const tools: ExtensionToolFile[] = []

  for (const file of files) {
    let definition: ExtensionTool
    try {
      definition = JSON.parse(await folder.readText(file.path))
    } catch (exception) {
      const message = getErrorMessage(exception)
      throw new Error(`${file.path}: ${message}`)
    }

    tools.push({
      definition: {
        ...definition,
        toolId: file.id,
        name: definition.name || file.id,
        category: definition.category ?? manifest.category,
        version: definition.version ?? manifest.version,
        author: definition.author ?? manifest.author
      },
      path: file.path,
      folder: file.folder
    })
  }

  return tools
}
