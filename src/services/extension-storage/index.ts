import { type ExtensionStorage } from "src/types/ExtensionStorage"
import { isRunningInTauri } from "src/utils/common/is-running-in-tauri"

import { BrowserExtensionStorage } from "./browser-extension-storage.js"
import { DiskExtensionStorage } from "./disk-extension-storage.js"

export { DiskExtensionFolder, isIgnoredEntry, resolveDiskPath } from "./disk-extension-storage.js"

/**
 * Where installed extensions are kept, picked once: the extensions folder in
 * the desktop app, IndexedDB in the browser
 */
export const extensionStorage: ExtensionStorage = isRunningInTauri
  ? new DiskExtensionStorage()
  : new BrowserExtensionStorage()
