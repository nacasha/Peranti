import localforage from "localforage"

import { StorageKeys } from "src/constants/storage-keys"
import { Applet } from "src/models/Applet"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletStore } from "src/services/applet-store"
import { sessionStore } from "src/services/session-store"
import { type AppletState } from "src/types/AppletState"

export class StorageManager {
  static async getAppletStateFromStorage(sessionId: string) {
    const storedAppletData: { state: AppletState } | null = await localforage.getItem(
      StorageKeys.AppletState.concat(sessionId)
    )
    return storedAppletData?.state
  }

  static async removeAppletStateFromStorage(sessionId: string) {
    await localforage.removeItem(
      StorageKeys.AppletState.concat(sessionId)
    )
  }

  static async putAppletStateIntoStorage(sessionId: string, appletState: AppletState) {
    await localforage.setItem(
      StorageKeys.AppletState.concat(sessionId),
      { state: appletState }
    )
  }

  static async updateAppletStatePropertyInStorage(sessionId: string, replaceAppletState: Partial<AppletState>) {
    const existingState = await StorageManager.getAppletStateFromStorage(sessionId)
    if (existingState) {
      const newState = { ...existingState, ...replaceAppletState }
      await StorageManager.putAppletStateIntoStorage(sessionId, newState)
    }
  }

  static async getAppletFromStorage(sessionId: string, options: {
    disablePersistence?: boolean
    initialState?: Partial<AppletState>
  } = {}) {
    const activeApplet = activeAppletStore.getActiveApplet()
    if (activeApplet.sessionId === sessionId) {
      return activeApplet
    }

    const runningApplet = sessionStore.runningApplets[sessionId]
    if (runningApplet && runningApplet !== undefined) {
      return runningApplet
    }

    const { disablePersistence = false, initialState = {} } = options
    const appletState = await StorageManager.getAppletStateFromStorage(sessionId)
    if (appletState) {
      const appletConstructor = appletStore.mapOfLoadedApplets[appletState.appletId]
      return new Applet(appletConstructor, {
        initialState: { ...appletState, ...initialState },
        disablePersistence
      })
    }
  }
}
