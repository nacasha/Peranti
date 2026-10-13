import { appletStore } from "src/services/applet-store"
import { sessionStore } from "src/services/session-store"

/**
 * Open an extension in its own tab, or switch to that tab when it's open
 */
export function openExtensionPage(extensionId: string, name: string) {
  const appletConstructor = appletStore.registerExtensionPage(extensionId, name)
  sessionStore.findOrCreateSession(appletConstructor)
}
