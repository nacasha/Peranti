import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys.ts"
import { type Tool } from "src/models/Tool.ts"
import { ToolStorageManager } from "src/services/toolStorageManager.ts"
import { type SessionHistory } from "src/types/SessionHistory.ts"

import { activeSessionStore } from "./activeSessionStore.ts"
import { sessionStore } from "./sessionStore.ts"

class SessionHistoryStore {
  histories: SessionHistory[] = []

  numberOfMaximumHistory = 100

  autoSaveDelayInSeconds = 1

  constructor() {
    makeAutoObservable(this)

    this.setupPersistence()
  }

  /**
   * Setup store persistence
   */
  setupPersistence() {
    void makePersistable(this, {
      name: StorageKeys.ToolHistoryStore,
      storage: localforage,
      stringify: false,
      properties: ["histories", "numberOfMaximumHistory", "autoSaveDelayInSeconds"]
    })
  }

  addHistory(tool: Tool) {
    /**
     * Skip save tool because it's already exists
     */
    if (this.histories.findIndex((history) => history.sessionId === tool.sessionId) > -1) {
      return true
    }

    /**
     * Save tool state to history only if tool has input or output modified
     */
    const isToolValuesModified = (tool.isInputValuesModified || tool.isOutputValuesModified)
    if (tool.actionRunCount > 0 && isToolValuesModified && tool.getIsInputOrOutputHasValues()) {
      this.histories.unshift(tool.toHistory())

      /**
       * Delete old history if exceeding allowed maximum history
       */
      if (this.histories.length > this.numberOfMaximumHistory) {
        this.histories = this.histories.slice(0, this.numberOfMaximumHistory)
      }

      return true
    }

    return false
  }

  /**
   * Open tool history entry and set as readonly active tool
   *
   * @param toolHistory
   */
  async openHistory(toolHistory: SessionHistory) {
    const retrievedTool = await ToolStorageManager.getToolFromStorage(toolHistory.sessionId, {
      /**
       * There are some known bug where `isDeleted` has value `true` even already
       * included in tool history store, so we're just gonna force it here
       */
      initialState: {
        isDeleted: true
      }
    })

    if (retrievedTool) {
      activeSessionStore.setActiveTool(retrievedTool)
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
    void ToolStorageManager.removeToolStateFromStorage(sessionId)

    if (activeSessionStore.getActiveTool().sessionId === sessionId) {
      void sessionStore.openLastActiveSession()
    }
  }

  async restoreLastHistory() {
    const toolHistory = this.histories[0]

    if (toolHistory) {
      void this.restoreHistory(toolHistory.sessionId)
    }
  }

  /**
   * Get specific history list of tool by its toolId
   *
   * @param toolId
   */
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
