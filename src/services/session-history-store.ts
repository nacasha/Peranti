import NiceModal from "@ebay/nice-modal-react"
import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { ConfirmDialog } from "src/components/dialog/ConfirmDialog/ConfirmDialog.tsx"
import { StorageKeys } from "src/constants/storage-keys.ts"
import { type Applet } from "src/models/Applet.ts"
import { StorageManager } from "src/services/storage-manager.ts"
import { type SessionHistory } from "src/types/SessionHistory.ts"

import { activeAppletStore } from "./active-applet-store.ts"
import { sessionStore } from "./session-store.ts"

class SessionHistoryStore {
  histories: SessionHistory[] = []

  numberOfMaximumHistory = 100

  autoSaveDelayInSeconds = 1

  featureEnabled = false

  constructor() {
    makeAutoObservable(this)

    this.setupPersistence()
  }

  setupPersistence() {
    void makePersistable(this, {
      name: StorageKeys.SessionHistoryStore,
      storage: localforage,
      stringify: false,
      properties: ["histories", "numberOfMaximumHistory", "autoSaveDelayInSeconds"]
    })
  }

  addHistory(applet: Applet) {
    if (!this.featureEnabled) {
      return false
    }

    if (this.histories.findIndex((history) => history.sessionId === applet.sessionId) > -1) {
      return true
    }

    const isValuesModified = (applet.isInputValuesModified || applet.isOutputValuesModified)
    if (applet.actionRunCount > 0 && isValuesModified && applet.getIsInputOrOutputHasValues()) {
      this.histories.unshift(applet.toHistory())

      if (this.histories.length > this.numberOfMaximumHistory) {
        this.histories = this.histories.slice(0, this.numberOfMaximumHistory)
      }

      return true
    }

    return false
  }

  async openHistory(sessionHistory: SessionHistory) {
    const storedApplet = await StorageManager.getAppletFromStorage(sessionHistory.sessionId, {
      initialState: {
        isDeleted: true
      }
    })

    if (storedApplet) {
      activeAppletStore.setActiveApplet(storedApplet)
    }
  }

  async restoreHistory(sessionId: string) {
    const sessionHistoryIndex = this.histories.findIndex((history) => history.sessionId === sessionId)
    const sessionHistory = this.histories[sessionHistoryIndex]

    if (sessionHistory) {
      this.removeHistoryEntry(sessionId)
      void sessionStore.openHistory(sessionHistory)
    }
  }

  deleteHistory(sessionId: string) {
    this.histories = this.histories.filter((history) => history.sessionId !== sessionId)
    void StorageManager.removeAppletStateFromStorage(sessionId)

    if (activeAppletStore.getActiveApplet().sessionId === sessionId) {
      void sessionStore.openCurrentlyActiveSession()
    }
  }

  async restoreLastHistory() {
    const sessionHistory = this.histories[0]

    if (sessionHistory) {
      void this.restoreHistory(sessionHistory.sessionId)
    }
  }

  getHistoryOfAppletId(appletId: string) {
    return this.histories.filter((history) => history.appletId === appletId)
  }

  private removeHistoryEntry(sessionId: string) {
    this.histories = this.histories.filter(
      (history) => history.sessionId !== sessionId
    )
  }

  clearAllHistory() {
    this.histories = []
  }

  clearAllHistoryWithConfirm() {
    void NiceModal.show(ConfirmDialog, {
      title: "Clear Closed Editor",
      description: "Your closed editors history will be cleared",
      onConfirm: () => {
        this.clearAllHistory()
      }
    })
  }
}

export const sessionHistoryStore = new SessionHistoryStore()
