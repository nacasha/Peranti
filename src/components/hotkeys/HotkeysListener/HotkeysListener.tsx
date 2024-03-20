import settingsApplet from "src/applets/pages/settings-applet"
import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { hotkeysStore } from "src/services/hotkeys-store"
import { sessionStore } from "src/services/session-store"

export const HotkeysListener = () => {
  useHotkeysModified(hotkeysStore.keys.OPEN_SETTINGS, (event) => {
    event.preventDefault()
    sessionStore.findOrCreateSession(settingsApplet)
  })

  return null
}
