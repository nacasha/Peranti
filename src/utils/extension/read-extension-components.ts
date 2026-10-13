import { FileNames } from "src/constants/file-names"
import { type ExtensionComponent } from "src/types/ExtensionComponent"
import { type ExtensionComponentFile } from "src/types/ExtensionComponentFile"
import { type ExtensionFolderReader } from "src/types/ExtensionFolderReader"

import { getComponentPropsDefinitionError } from "../component/get-component-props-definition-error.js"
import { getComponentValueDefinitionError } from "../component/get-component-value-definition-error.js"

import { findExtensionDefinitionFiles } from "./find-extension-definition-files.js"
import { isSafeRelativePath } from "./is-safe-relative-path.js"

const KINDS = ["input", "output", "both"]

/**
 * Read every `components/<folder>/peranti.component.json` of an extension.
 * The folder name in kebab case is the component ID. Throws on the first
 * broken component, naming its file.
 */
export async function readExtensionComponents(folder: ExtensionFolderReader): Promise<ExtensionComponentFile[]> {
  const files = findExtensionDefinitionFiles(folder.filePaths, "components", FileNames.ExtensionComponentDefinition)
  const components: ExtensionComponentFile[] = []

  for (const file of files) {
    let definition: ExtensionComponent
    try {
      definition = JSON.parse(await folder.readText(file.path))
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : String(exception)
      throw new Error(`${file.path}: ${message}`)
    }

    if (!definition.entry || !isSafeRelativePath(definition.entry)) {
      throw new Error(`${file.path}: "entry" must be an HTML file next to it`)
    }
    if (definition.kind !== undefined && !KINDS.includes(definition.kind)) {
      throw new Error(`${file.path}: "kind" must be one of ${KINDS.join(", ")}`)
    }
    if (definition.value !== undefined) {
      const valueError = getComponentValueDefinitionError(definition.value)
      if (valueError) {
        throw new Error(`${file.path}: ${valueError}`)
      }
    }
    if (definition.props !== undefined) {
      const propsError = getComponentPropsDefinitionError(definition.props)
      if (propsError) {
        throw new Error(`${file.path}: ${propsError}`)
      }
    }

    components.push({
      definition: { ...definition, componentId: file.id, name: definition.name || file.id },
      path: file.path,
      folderPath: await folder.resolveFolder(file.folder)
    })
  }

  return components
}
