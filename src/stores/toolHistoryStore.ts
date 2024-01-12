import { makeAutoObservable, toJS } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { type ToolHistory } from "src/types/ToolHistory"

class ToolHistoryStore {
  history: ToolHistory[] = []

  lastState: Record<string, ToolHistory> = {}

  numberOfMaximumHistory = 100

  autoSaveDelayInSeconds = 1

  addDebounceState = setTimeout(() => null, 0)

  constructor() {
    makeAutoObservable(this)

    void makePersistable(this, {
      name: "ToolHistoryStore",
      properties: ["history", "numberOfMaximumHistory", "autoSaveDelayInSeconds", "lastState"],
      storage: window.localStorage
    })
  }

  add(toolHistory: ToolHistory, immediately?: boolean) {
    if (this.addDebounceState) {
      clearTimeout(this.addDebounceState)
    }

    this.addDebounceState = setTimeout(() => {
      this.addDebounced(toolHistory)
    }, this.autoSaveDelayInSeconds * (immediately ? 0 : 1000))
  }

  setLastState(toolHistory: ToolHistory) {
    this.lastState[toolHistory.toolId] = toolHistory
  }

  getLastStateOfToolId(toolId: string) {
    return toJS(this.lastState[toolId])
  }

  private addDebounced(toolHistory: ToolHistory) {
    /**
     * Save tool state to history only if last saved history instanceID has different SHA256 hash
     */
    const lastSavedHistoryOfTool = this.getHistoryOfToolId(toolHistory.toolId)[0]
    if (!lastSavedHistoryOfTool || lastSavedHistoryOfTool.inputOutputHash !== toolHistory.inputOutputHash) {
      this.history.unshift(toolHistory)
    }

    /**
     * Delete old history if exceeding allowed maximum history
     */
    if (this.history.length > this.numberOfMaximumHistory) {
      this.history = this.history.slice(0, this.numberOfMaximumHistory)
    }
  }

  /**
   * Get specific history list of tool by its toolId
   *
   * @param toolId
   */
  getHistoryOfToolId(toolId: string) {
    return this.history.filter((history) => history.toolId === toolId)
  }
}

export const toolHistoryStore = new ToolHistoryStore()
