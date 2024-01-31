import localforage from "localforage"

import { StorageKeys } from "src/constants/storage-keys"
import { Tool } from "src/models/Tool"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolSessionStore } from "src/stores/toolSessionStore"
import { toolStore } from "src/stores/toolStore"
import { type ToolState } from "src/types/ToolState"

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ToolStateManager {
  /**
   * Retrieve toolState from storage
   *
   * @param sessionId
   * @returns
   */
  static async getToolStateFromStorage(sessionId: string) {
    const storedToolData: { toolState: ToolState } | null = await localforage.getItem(
      StorageKeys.ToolState.concat(sessionId)
    )
    return storedToolData?.toolState
  }

  /**
   * Remove toolState from storage
   *
   * @param sessionId
   */
  static async removeToolStateFromStorage(sessionId: string) {
    await localforage.removeItem(
      StorageKeys.ToolState.concat(sessionId)
    )
  }

  /**
   * Update all properties of toolState in storage
   *
   * @param sessionId
   * @param toolState
   */
  static async putToolStateIntoStorage(sessionId: string, toolState: ToolState) {
    await localforage.setItem(
      StorageKeys.ToolState.concat(sessionId),
      { toolState }
    )
  }

  /**
   * Partially update properties of toolState in storage
   *
   * @param sessionId
   * @param replacedToolState
   */
  static async updateToolStatePropertyInStorage(sessionId: string, replacedToolState: Partial<ToolState>) {
    const existingToolState = await ToolStateManager.getToolStateFromStorage(sessionId)
    if (existingToolState) {
      const newToolState = { ...existingToolState, ...replacedToolState }
      await ToolStateManager.putToolStateIntoStorage(sessionId, newToolState)
    }
  }

  /**
   * Retrieve tool from storage and create new instance of tool based on toolState
   *
   * @param toolData
   * @param options
   * @returns
   */
  static async getToolFromStorage(sessionId: string, options: {
    /**
     * Disable persistence for created tool
     */
    disablePersistence?: boolean

    /**
     * Replace initial state of tool
     */
    initialState?: Partial<ToolState>
  } = {}) {
    /**
     * Return from active tool if it's current active
     */
    const activeTool = toolRunnerStore.getActiveTool()
    if (activeTool.sessionId === sessionId) {
      return activeTool
    }

    /**
     * Try to retrieve tool from running tools when exists to get
     * same reference from mobx store
     */
    const runningTool = toolSessionStore.runningTools[sessionId]
    if (runningTool && runningTool !== undefined) {
      return runningTool
    }

    /**
     * Create new instance of tool based on toolState in storage
     */
    const { disablePersistence = false, initialState = {} } = options
    const toolState = await ToolStateManager.getToolStateFromStorage(sessionId)
    if (toolState) {
      const toolConstructor = toolStore.mapOfLoadedTools[toolState.toolId]
      return new Tool(toolConstructor, {
        initialState: { ...toolState, ...initialState },
        disablePersistence
      })
    }
  }
}
