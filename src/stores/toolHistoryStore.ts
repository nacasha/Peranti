import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { Tool } from "src/models/Tool"
import { type ToolHistory } from "src/types/ToolHistory"

import { toolRunnerStore } from "./toolRunnerStore.js"
import { toolStore } from "./toolStore.js"

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

  addHistory(toolHistory: ToolHistory) {
    /**
     * Save tool state to history only if last saved history has different SHA256 hash
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
   * Open tool history entry and set as readonly active tool
   *
   * @param toolHistory
   */
  openHistory(toolHistory: ToolHistory) {
    const toolConstructor = toolStore.mapOfToolsAndPresets[toolHistory.toolId]
    const toolSession = new Tool(toolConstructor, { toolHistory, isReadOnly: true })
    toolRunnerStore.setActiveTool(toolSession)
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
