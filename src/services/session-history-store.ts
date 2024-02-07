import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

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

  addHistory(tool: Applet) {
    if (this.histories.findIndex((history) => history.sessionId === tool.sessionId) > -1) {
      return true
    }

    const isToolValuesModified = (tool.isInputValuesModified || tool.isOutputValuesModified)
    if (tool.actionRunCount > 0 && isToolValuesModified && tool.getIsInputOrOutputHasValues()) {
      this.histories.unshift(tool.toHistory())

      if (this.histories.length > this.numberOfMaximumHistory) {
        this.histories = this.histories.slice(0, this.numberOfMaximumHistory)
      }

      return true
    }

    return false
  }

  async openHistory(toolHistory: SessionHistory) {
    const retrievedTool = await StorageManager.getAppletFromStorage(toolHistory.sessionId, {

      initialState: {
        isDeleted: true
      }
    })

    if (retrievedTool) {
      activeAppletStore.setActiveApplet(retrievedTool)
    }
  }

  async restoreHistory(sessionId: string) {
    const toolHistoryIndex = this.histories.findIndex((history) => history.sessionId === sessionId)
    const toolHistory = this.histories[toolHistoryIndex]

    if (toolHistory) {
      this.removeHistoryEntry(sessionId)
      void sessionStore.openHistory(toolHistory)
    }
  }

  deleteHistory(sessionId: string) {
    this.histories = this.histories.filter((history) => history.sessionId !== sessionId)
    void StorageManager.removeAppletStateFromStorage(sessionId)

    if (activeAppletStore.getActiveApplet().sessionId === sessionId) {
      void sessionStore.openLastActiveSession()
    }
  }

  async restoreLastHistory() {
    const toolHistory = this.histories[0]

    if (toolHistory) {
      void this.restoreHistory(toolHistory.sessionId)
    }
  }

  getHistoryOfToolId(toolId: string) {
    return this.histories.filter((history) => history.toolId === toolId)
  }

  private removeHistoryEntry(sessionId: string) {
    this.histories = this.histories.filter(
      (history) => history.sessionId !== sessionId
    )
  }
}

export const sessionHistoryStore = new SessionHistoryStore()