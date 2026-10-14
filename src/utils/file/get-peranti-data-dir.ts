import { homeDir, join } from "@tauri-apps/api/path"

import { Folders } from "src/constants/folders"

/**
 * The user data folder, `.peranti` in the home folder on every OS
 */
export async function getPerantiDataDir() {
  return await join(await homeDir(), Folders.UserData)
}
