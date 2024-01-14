import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { Tool } from "src/models/Tool.ts"
import { type ToolConstructor } from "src/types/ToolConstructor.js"
import { type ToolHistory } from "src/types/ToolHistory.ts"

class ToolRunnerStore {
  /**
   * Indicates history panel is opened or closed
   */
  private _isHistoryPanelOpen = false

  /**
   * Store active tool that currently used
   */
  private _activeTool?: Tool = undefined

  /**
   * Determine whether current active tool has batch operations
   */
  get toolHasBatchOutput() {
    return this.getActiveTool().getInputFields().some((output) => output.allowBatch)
  }

  get isHistoryPanelOpen() {
    return this._isHistoryPanelOpen
  }

  /**
   * Make this class observable
   */
  constructor() {
    makeAutoObservable(this)

    void makePersistable(this, {
      name: "ToolStore",
      properties: [],
      storage: window.localStorage
    })
  }

  setActiveTool(tool: Tool) {
    this._activeTool = tool
  }

  /**
   * Get current active tool, or return empty if there is no active tool
   *
   * @returns Tool
   */
  getActiveTool() {
    const activeTool = this._activeTool

    if (activeTool) {
      return activeTool
    }

    return new Tool({
      name: "",
      toolId: "",
      category: "",
      action: () => ({}),
      inputFields: [],
      outputFields: []
    })
  }

  /**
   * Check whether passed tool in arguments is currently active
   *
   * @param tool
   * @returns
   */
  isToolActive(tool: ToolConstructor | ToolHistory) {
    return this.getActiveTool().toolId === tool.toolId
  }

  /**
   * Check whether passed tool in arguments is currently active
   *
   * @param tool
   * @returns
   */
  isToolActiveBySessionId(tool: Tool | ToolHistory) {
    return this.getActiveTool().sessionId === tool.sessionId
  }

  /**
   * Run active tool and save to history
   */
  runActiveTool() {
    void this.getActiveTool().run()
  }

  /**
   * Toggle open and close history panel
   */
  toggleHistoryPanel() {
    this._isHistoryPanelOpen = !this._isHistoryPanelOpen
  }

  /**
   * Toggle enable and disable batch mode
   */
  toggleBatchMode() {
    const enabled = !this.getActiveTool().isBatchEnabled
    this.getActiveTool().setBatchMode(enabled)
  }

  /**
   * Clean current active tool editor input and output state
   */
  cleanActiveToolState() {
    const activeTool = this.getActiveTool()

    this.setActiveTool(new Tool({ ...activeTool }))
  }
}

export const toolRunnerStore = new ToolRunnerStore()
