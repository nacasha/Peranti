import localforage from "localforage"

import { StorageKeys } from "src/constants/storage-keys"
import { Tool } from "src/models/Tool"
import { activeSessionStore } from "src/stores/activeSessionStore"
import { sessionStore } from "src/stores/sessionStore"
import { toolStore } from "src/stores/toolStore"
import { type ToolState } from "src/types/ToolState"

export class ToolStorageManager {
  static async getToolStateFromStorage(sessionId: string) {
    const storedToolData: { toolState: ToolState } | null = await localforage.getItem(
      StorageKeys.ToolState.concat(sessionId)
    )
    return storedToolData?.toolState
  }

  static async removeToolStateFromStorage(sessionId: string) {
    await localforage.removeItem(
      StorageKeys.ToolState.concat(sessionId)
    )
  }

  static async putToolStateIntoStorage(sessionId: string, toolState: ToolState) {
    await localforage.setItem(
      StorageKeys.ToolState.concat(sessionId),
      { toolState }
    )
  }

  static async updateToolStatePropertyInStorage(sessionId: string, replacedToolState: Partial<ToolState>) {
    const existingToolState = await ToolStorageManager.getToolStateFromStorage(sessionId)
    if (existingToolState) {
      const newToolState = { ...existingToolState, ...replacedToolState }
      await ToolStorageManager.putToolStateIntoStorage(sessionId, newToolState)
    }
  }

  static async getToolFromStorage(sessionId: string, options: {
    disablePersistence?: boolean
    initialState?: Partial<ToolState>
  } = {}) {
    const activeTool = activeSessionStore.getActiveTool()
    if (activeTool.sessionId === sessionId) {
      return activeTool
    }

    const runningTool = sessionStore.runningTools[sessionId]
    if (runningTool && runningTool !== undefined) {
      return runningTool
    }

    const { disablePersistence = false, initialState = {} } = options
    const toolState = await ToolStorageManager.getToolStateFromStorage(sessionId)
    if (toolState) {
      const toolConstructor = toolStore.mapOfLoadedTools[toolState.toolId]
      return new Tool(toolConstructor, {
        initialState: { ...toolState, ...initialState },
        disablePersistence
      })
    }
  }
}
