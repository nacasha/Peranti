import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys.js"
import { Tool } from "src/models/Tool"
import { type ToolHistory } from "src/types/ToolHistorySimple.js"
import { type ToolState } from "src/types/ToolState.js"

import { toolRunnerStore } from "./toolRunnerStore.js"
import { toolSessionStore } from "./toolSessionStore.js"
import { toolStore } from "./toolStore.js"

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
    const retrievedTool = await this.getToolFromStorage(toolHistory, { disablePersistence: true })
    if (retrievedTool) {
      toolRunnerStore.setActiveTool(retrievedTool)
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

  /**
   * Load tool from local storage and create new instance of tool
   *
   * @param toolHistory
   * @param options
   * @returns
   */
  async getToolFromStorage(toolHistory: ToolHistory, options: { disablePersistence?: boolean } = {}) {
    /**
     * Try to retrieve tool from storage
     */
    const { disablePersistence = false } = options
    const toolConstructor = toolStore.mapOfLoadedTools[toolHistory.toolId]
    const toolState = await Tool.getToolStateFromStorage(toolHistory.sessionId)

    if (toolState) {
      return new Tool(toolConstructor, {
        initialState: toolState,
        isHistory: true,
        disablePersistence
      })
    }
  }

  async restoreHistory(sessionId: string) {
    const toolHistorySimpleIndex = this.histories.findIndex((history) => history.sessionId === sessionId)
    const toolHistorySimple = this.histories[toolHistorySimpleIndex]

    if (toolHistorySimple) {
      const toolHistory = await this.getToolFromStorage(toolHistorySimple, { disablePersistence: true })

      if (toolHistory) {
        toolSessionStore.createSessionFromHistory(toolHistory.toState())
      }
    }

    this.fromSessionIdFromHistories(sessionId)
  }

  fromSessionIdFromHistories(sessionId: string) {
    this.histories = this.histories.filter(
      (history) => history.sessionId !== sessionId
    )
  }
}

export const toolHistoryStore = new ToolHistoryStore()
