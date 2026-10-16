import { DEFAULT_EXTENSION_COMPONENT_KIND, ExtensionComponentKinds } from "src/constants/extension-component-kinds"
import { FileNames } from "src/constants/file-names"
import { type ExtensionComponent, type ExtensionComponentKind } from "src/types/ExtensionComponent"
import { type ExtensionComponentFile } from "src/types/ExtensionComponentFile"
import { type ExtensionComponentMode } from "src/types/ExtensionComponentMessage"
import { type ExtensionDefinitionFile } from "src/types/ExtensionDefinitionFile"
import { type ExtensionFolderReader } from "src/types/ExtensionFolderReader"
import { type ExtensionManifest } from "src/types/ExtensionManifest"
import { type ExtensionTool } from "src/types/ExtensionTool"
import { type ExtensionToolFile } from "src/types/ExtensionToolFile"
import { getErrorMessage } from "src/utils/common/get-error-message"
import { getComponentPropsDefinitionError } from "src/utils/component/get-component-props-definition-error"
import { getComponentValueDefinitionError } from "src/utils/component/get-component-value-definition-error"
import { toKebabCase } from "src/utils/text/to-kebab-case"

import { getExtensionComponentKey, parseComponentReference } from "./extension-ids.js"
import { isSafeRelativePath } from "./extension-paths.js"

/**
 * Reading and checking the definition files of an extension: the tools in
 * `tools/<folder>/peranti.tool.json` and the components in
 * `components/<folder>/peranti.component.json`
 */

const TOOLS_FOLDER = "tools"
const COMPONENTS_FOLDER = "components"

// -----------------------------------------------------------------------------
// Component kinds
// -----------------------------------------------------------------------------

/**
 * Where a component can be used, its declared kind or the default
 */
export function getComponentKind(component: { kind?: ExtensionComponentKind }): ExtensionComponentKind {
  return component.kind ?? DEFAULT_EXTENSION_COMPONENT_KIND
}

/**
 * Whether a component of `kind` can be an input or output field
 */
export function isComponentKindUsableAs(kind: ExtensionComponentKind, mode: ExtensionComponentMode): boolean {
  return kind === DEFAULT_EXTENSION_COMPONENT_KIND || kind === mode
}

// -----------------------------------------------------------------------------
// Definition files
// -----------------------------------------------------------------------------

/**
 * Every `<group>/<folder>/<fileName>` among an extension's files, such as
 * `tools/word-count/peranti.tool.json`, sorted by folder. The folder names
 * are the IDs, so two folders that give the same ID throw.
 */
export function findExtensionDefinitionFiles(
  filePaths: string[],
  group: string,
  fileName: string
): ExtensionDefinitionFile[] {
  const folderNames = filePaths
    .map((path) => path.split("/"))
    .filter((segments) => (
      segments.length === 3 &&
      segments[0] === group &&
      segments[2] === fileName &&
      !segments[1].startsWith(".")
    ))
    .map((segments) => segments[1])
    .sort((a, b) => a.localeCompare(b))

  const files: ExtensionDefinitionFile[] = []
  const folderNameById = new Map<string, string>()

  for (const folderName of folderNames) {
    const id = toKebabCase(folderName)
    if (!id) {
      throw new Error(`${group}/${folderName}: the folder name needs a letter or digit`)
    }

    const otherFolderName = folderNameById.get(id)
    if (otherFolderName !== undefined) {
      throw new Error(`${group}/${otherFolderName} and ${group}/${folderName} both give the ID "${id}"`)
    }
    folderNameById.set(id, folderName)

    files.push({ id, path: `${group}/${folderName}/${fileName}`, folder: `${group}/${folderName}` })
  }

  return files
}

/**
 * Parsed JSON of a definition file, failing with the file's path
 */
async function readDefinition<T>(folder: ExtensionFolderReader, path: string): Promise<T> {
  try {
    return JSON.parse(await folder.readText(path))
  } catch (exception) {
    throw new Error(`${path}: ${getErrorMessage(exception)}`)
  }
}

/**
 * Every tool of an extension, filling in the category, version and author of
 * the extension. The folder name in kebab case is the tool ID. Throws on the
 * first broken tool, naming its file.
 */
export async function readExtensionTools(manifest: ExtensionManifest, folder: ExtensionFolderReader): Promise<ExtensionToolFile[]> {
  const files = findExtensionDefinitionFiles(folder.filePaths, TOOLS_FOLDER, FileNames.ExtensionToolDefinition)

  if (files.length === 0) {
    throw new Error(`No tools: add a folder in "${TOOLS_FOLDER}" with a ${FileNames.ExtensionToolDefinition}`)
  }

  const tools: ExtensionToolFile[] = []

  for (const file of files) {
    const definition = await readDefinition<ExtensionTool>(folder, file.path)

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

/**
 * Why a component definition is invalid, or undefined when it's fine
 */
function getComponentDefinitionError(definition: ExtensionComponent): string | undefined {
  if (!definition.entry || !isSafeRelativePath(definition.entry)) {
    return "\"entry\" must be an HTML file next to it"
  }
  if (definition.kind !== undefined && !ExtensionComponentKinds.includes(definition.kind)) {
    return `"kind" must be one of ${ExtensionComponentKinds.join(", ")}`
  }
  if (definition.maximizable !== undefined && typeof definition.maximizable !== "boolean") {
    return "\"maximizable\" must be true or false"
  }

  const valueError = definition.value === undefined ? undefined : getComponentValueDefinitionError(definition.value)
  const propsError = definition.props === undefined ? undefined : getComponentPropsDefinitionError(definition.props)

  return valueError ?? propsError
}

/**
 * Every component of an extension. The folder name in kebab case is the
 * component ID. Throws on the first broken component, naming its file.
 */
export async function readExtensionComponents(folder: ExtensionFolderReader): Promise<ExtensionComponentFile[]> {
  const files = findExtensionDefinitionFiles(folder.filePaths, COMPONENTS_FOLDER, FileNames.ExtensionComponentDefinition)
  const components: ExtensionComponentFile[] = []

  for (const file of files) {
    const definition = await readDefinition<ExtensionComponent>(folder, file.path)

    const error = getComponentDefinitionError(definition)
    if (error) {
      throw new Error(`${file.path}: ${error}`)
    }

    components.push({
      definition: { ...definition, componentId: file.id, name: definition.name || file.id },
      path: file.path,
      folder: file.folder
    })
  }

  return components
}

/**
 * Points the `"@<componentId>"` fields of a tool at the extension's own
 * components, by their registered key. Throws when a field names a component
 * the extension doesn't have, or uses an input-only one as an output and the
 * other way round.
 */
export function resolveExtensionToolComponents(
  tool: ExtensionTool,
  components: ExtensionComponentFile[],
  extensionId: string
): ExtensionTool {
  const resolveFields = (fields: unknown, mode: ExtensionComponentMode) => {
    if (!Array.isArray(fields)) {
      return fields
    }

    return fields.map((field) => {
      const componentId = parseComponentReference(field?.component)
      if (componentId === undefined) {
        return field
      }

      const component = components.find((item) => item.definition.componentId === componentId)
      if (!component) {
        throw new Error(`${tool.toolId}: field "${field.key}" uses ${field.component}, which the extension's "${COMPONENTS_FOLDER}" doesn't list`)
      }

      const kind = getComponentKind(component.definition)
      if (!isComponentKindUsableAs(kind, mode)) {
        throw new Error(`${tool.toolId}: ${field.component} is an ${kind} component, field "${field.key}" is an ${mode}`)
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
