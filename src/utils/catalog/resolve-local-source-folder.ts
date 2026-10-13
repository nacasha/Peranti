import { exists } from "@tauri-apps/plugin-fs"

import { ExtensionCatalog } from "src/constants/extension-catalog"
import { fileService } from "src/services/file-service"

/**
 * Folder whose subfolders are a local source's extensions: its `extensions`
 * folder when it has one, otherwise the source folder itself
 */
export async function resolveLocalSourceFolder(location: string) {
  if (!(await exists(location))) {
    throw new Error(`${location} does not exist`)
  }

  const nestedFolder = await fileService.resolveFilePath(location, ExtensionCatalog.extensionsFolderName)
  return await exists(nestedFolder) ? nestedFolder : location
}
