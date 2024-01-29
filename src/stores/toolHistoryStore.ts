import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys.js"
import { ToolStateManager } from "src/services/toolStorageManager.js"
import { type ToolHistory } from "src/types/ToolHistory.js"
import { type ToolState } from "src/types/ToolState.js"

import { toolRunnerStore } from "./toolRunnerStore.js"
import { toolSessionStore } from "./toolSessionStore.js"

class ToolHistoryStore {
  histories: ToolHistory[] = []

  numberOfMaximumHistory = 100

  autoSaveDelayInSeconds = 1

  addDebounceState = setTimeout(() => null, 0)

  constructor() {
    makeAutoObservable(this)

    void makePersistable(this, {
      name: StorageKeys.ToolHistoryStore,
      storage: localforage,
      stringify: false,
      properties: ["histories", "numberOfMaximumHistory", "autoSaveDelayInSeconds"]
    })
  }

  addHistory(toolState: ToolState) {
    /**
     * Skip save tool because it's already exists
     */
    if (this.histories.findIndex((history) => history.sessionId === toolState.sessionId) > -1) {
      return true
    }

    /**
     * Save tool state to history only if last saved history has different SHA256 hash
     */
    if (toolState.runCount > 0 && (toolState.isInputValuesModified || toolState.isInputValuesModified)) {
      const { createdAt, sessionId, sessionName, toolId } = toolState
      this.histories.unshift({ createdAt, sessionId, sessionName, toolId })
    }

    /**
     * Delete old history if exceeding allowed maximum history
     */
    if (this.histories.length > this.numberOfMaximumHistory) {
      this.histories = this.histories.slice(0, this.numberOfMaximumHistory)
    }

    return true
  }

  /**
   * Open tool history entry and set as readonly active tool
   *
   * @param toolHistory
   */
  async openHistory(toolHistory: ToolHistory) {
    const retrievedTool = await ToolStateManager.getToolFromStorage(toolHistory.sessionId)
    if (retrievedTool) {
      toolRunnerStore.setActiveTool(retrievedTool)
    }
  }

  async restoreHistory(sessionId: string) {
    const toolHistoryIndex = this.histories.findIndex((history) => history.sessionId === sessionId)
    const toolHistory = this.histories[toolHistoryIndex]

    if (toolHistory) {
      this.removeHistoryEntry(sessionId)
      void toolSessionStore.openHistory(toolHistory)
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

export const toolHistoryStore = new ToolHistoryStore()
