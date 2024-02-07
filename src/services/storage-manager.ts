import localforage from "localforage"

import { StorageKeys } from "src/constants/storage-keys"
import { Applet } from "src/models/Applet"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletStore } from "src/services/applet-store"
import { sessionStore } from "src/services/session-store"
import { type AppletState } from "src/types/AppletState"

export class StorageManager {
  static async getAppletStateFromStorage(sessionId: string) {
    const storedToolData: { toolState: AppletState } | null = await localforage.getItem(
      StorageKeys.AppletState.concat(sessionId)
    )
    return storedToolData?.toolState
  }

  static async removeAppletStateFromStorage(sessionId: string) {
    await localforage.removeItem(
      StorageKeys.AppletState.concat(sessionId)
    )
  }

  static async putAppletStateIntoStorage(sessionId: string, toolState: AppletState) {
    await localforage.setItem(
      StorageKeys.AppletState.concat(sessionId),
      { toolState }
    )
  }

  static async updateAppletStatePropertyInStorage(sessionId: string, replacedToolState: Partial<AppletState>) {
    const existingToolState = await StorageManager.getAppletStateFromStorage(sessionId)
    if (existingToolState) {
      const newToolState = { ...existingToolState, ...replacedToolState }
      await StorageManager.putAppletStateIntoStorage(sessionId, newToolState)
    }
  }

  static async getAppletFromStorage(sessionId: string, options: {
    disablePersistence?: boolean
    initialState?: Partial<AppletState>
  } = {}) {
    const activeTool = activeAppletStore.getActiveApplet()
    if (activeTool.sessionId === sessionId) {
      return activeTool
    }

    const runningTool = sessionStore.runningApplets[sessionId]
    if (runningTool && runningTool !== undefined) {
      return runningTool
    }

    const { disablePersistence = false, initialState = {} } = options
    const toolState = await StorageManager.getAppletStateFromStorage(sessionId)
    if (toolState) {
      const toolConstructor = appletStore.mapOfLoadedApplets[toolState.appletId]
      return new Applet(toolConstructor, {
        initialState: { ...toolState, ...initialState },
        disablePersistence
      })
    }
  }
}
