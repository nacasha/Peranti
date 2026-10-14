import { FileNames } from "src/constants/file-names"
import { type CatalogExtension, type CatalogExtensionFile } from "src/types/CatalogExtension"
import { type ExtensionFolderReader } from "src/types/ExtensionFolderReader"
import { type ExtensionManifest } from "src/types/ExtensionManifest"

import { readExtensionComponents } from "../extension/read-extension-components.js"
import { readExtensionTools } from "../extension/read-extension-tools.js"
import { summarizeExtensionTool } from "../extension/summarize-extension-tool.js"

/**
 * Catalog entry of an extension folder, read from its `peranti.json` and the
 * definition files of its tools and components. Throws when any is broken.
 */
export async function readCatalogExtension(
  id: string,
  path: string,
  folder: ExtensionFolderReader,
  files: CatalogExtensionFile[],
  sourceId: string
): Promise<CatalogExtension> {
  const manifest: ExtensionManifest = JSON.parse(await folder.readText(FileNames.ExtensionDefinition))

  // Read at the same time, a remote catalog downloads each file
  const [tools, components] = await Promise.all([
    readExtensionTools(manifest, folder),
    readExtensionComponents(folder)
  ])

  return {
    id,
    name: manifest.name || id,
    description: manifest.description,
    version: manifest.version ?? "0.0.0",
    author: manifest.author,
    category: manifest.category,
    tools: tools.map(summarizeExtensionTool),
    components: components.map(({ definition, path: componentPath }) => ({
      componentId: definition.componentId,
      name: definition.name,
      description: definition.description,
      kind: definition.kind,
      value: definition.value,
      props: definition.props,
      entry: definition.entry,
      path: componentPath
    })),
    path,
    files,
    sourceId
  }
}
