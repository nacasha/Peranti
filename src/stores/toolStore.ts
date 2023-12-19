import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { ToolRunModeEnum } from "src/enums/ToolRunTypeEnum"
import { Tool } from "src/models/Tool.ts"
import { mapOfTools } from "src/tools"
import { type ToolHistory } from "src/types/ToolHistory.ts"

import { toolHistoryStore } from "./toolHistoryStore.js"

class ToolStore {
  /**
   * Store active tool that currently used
   */
  _activeTool?: Tool = undefined

  _runMode: ToolRunModeEnum = ToolRunModeEnum.OnChange

  isHistoryPanelOpen = false

  /**
   * Make this class observable
   */
  constructor() {
    makeAutoObservable(this)

    void makePersistable(this, {
      name: "ToolStore",
      properties: ["_runMode"],
      storage: window.localStorage
    })
  }

  /**
   * Open tool and set it as active tool while save the previous tool as history
   *
   * @param tool
   */
  openTool(tool: Tool) {
    if (this.getActiveTool().instanceId !== tool.instanceId) {
      this.saveActiveToolStateToHistory()
      this._activeTool = tool.openTool()
    }
  }

  openToolFromViewedHistory() {
    const toolHistory = this.getActiveTool()
    const mainTool = mapOfTools[toolHistory.toolId]
    if (toolHistory) {
      this._activeTool = Tool.openFromHistory(mainTool, toolHistory)
    }
  }

  /**
   * Open history of tool and save the previous tool as history
   *
   * @param toolHistory
   */
  openHistory(toolHistory: ToolHistory) {
    const mainTool = mapOfTools[toolHistory.toolId]
    if (mainTool) {
      this.saveActiveToolStateToHistory()
      this._activeTool = Tool.fromHistory(mainTool, toolHistory)
    }
  }

  /**
   * Save tool to history when tool has been running at least once and not a tool history instance
   */
  saveActiveToolStateToHistory() {
    const activeTool = this._activeTool

    if (activeTool && activeTool.getIsDirty() && !activeTool.isReadOnly) {
      toolHistoryStore.add(activeTool.toHistory())
    }
  }

  /**
   * Get current active tool, or return empty if there is no active tool
   *
   * @returns Tool
   */
  getActiveTool() {
    const currentTool = this._activeTool
    if (currentTool) return currentTool
    return new Tool({
      name: "",
      action: () => ({}),
      inputs: [],
      outputs: [],
      toolId: "",
      category: ""
    })
  }

  /**
   * Get active tool name
   *
   * @returns String
   */
  getActiveToolName() {
    return this.getActiveTool().name
  }

  get isRunModeAuto() {
    return this._runMode === ToolRunModeEnum.OnChange
  }

  /**
   * Check whether passed tool in arguments is currently active
   *
   * @param tool
   * @returns
   */
  isToolActive(tool: Tool | ToolHistory) {
    return this.getActiveTool().instanceId === tool.instanceId
  }

  /**
   * Run active tool and save to history based on run mode
   */
  runActiveTool() {
    this.getActiveTool().run()
    this.saveActiveToolStateToHistory()
  }

  toggleHistoryPanel() {
    this.isHistoryPanelOpen = !this.isHistoryPanelOpen
  }
}

export const toolStore = new ToolStore()
