import { type ExtensionDefinitionFile } from "src/types/ExtensionDefinitionFile"

import { toKebabCase } from "../text/to-kebab-case.js"

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
