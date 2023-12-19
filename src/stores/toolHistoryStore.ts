import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { type ToolHistory } from "src/types/ToolHistory"

class ToolHistoryStore {
  history: ToolHistory[] = []

  numberOfMaximumHistory = 100

  autoSaveDelayInSeconds = 1

  addDebounceState = setTimeout(() => null, 0)

  constructor() {
    makeAutoObservable(this)

    void makePersistable(this, {
      name: "ToolHistoryStore",
      properties: ["history", "numberOfMaximumHistory", "autoSaveDelayInSeconds"],
      storage: window.localStorage
    })
  }

  add(toolHistory: ToolHistory) {
    if (this.addDebounceState) {
      clearTimeout(this.addDebounceState)
    }

    this.addDebounceState = setTimeout(() => {
      this.addDebounced(toolHistory)
    }, this.autoSaveDelayInSeconds * 1000)
  }

  private addDebounced(toolHistory: ToolHistory) {
    /**
     * Save tool state to history only if there is no matching instanceID (SHA256 hash)
     */
    if (this.history.findIndex((tool) => tool.instanceId === toolHistory.instanceId) === -1) {
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
  getWithToolId(toolId: string) {
    return this.history.filter((history) => history.toolId === toolId)
  }
}

export const toolHistoryStore = new ToolHistoryStore()
