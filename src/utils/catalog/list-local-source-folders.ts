import { exists, readDir } from "@tauri-apps/plugin-fs"

import { FileNames } from "src/constants/file-names"
import { DiskExtensionFolder, isIgnoredEntry, resolveDiskPath } from "src/services/extension-storage"
import { type CatalogSource } from "src/types/CatalogSource"

import { resolveLocalSourceFolder } from "./resolve-local-source-folder.js"

/**
 * Every extension in a local source: each subfolder with a `peranti.json`,
 * since a source can hold other folders too
 */
export async function listLocalSourceFolders(source: CatalogSource): Promise<DiskExtensionFolder[]> {
  const extensionsPath = await resolveLocalSourceFolder(source.location)
  const folders: DiskExtensionFolder[] = []

  for (const entry of await readDir(extensionsPath)) {
    if (!entry.isDirectory || isIgnoredEntry(entry.name)) continue

    const folderPath = await resolveDiskPath(extensionsPath, entry.name)
    if (await exists(await resolveDiskPath(folderPath, FileNames.ExtensionDefinition))) {
      folders.push(new DiskExtensionFolder(entry.name, folderPath))
    }
  }

  return folders
}
