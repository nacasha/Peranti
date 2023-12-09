import { makeAutoObservable } from "mobx"
import { Tool } from "src/models/Tool"
import { toolHistoryStore } from "./toolHistoryStore"
import { type ToolHistory } from "src/types/ToolHistory"
import { mapOfTool } from "src/tools"

class ToolStore {
  /**
   * Store active tool that currently used
   */
  protected activeTool?: Tool = undefined

  protected runMode: "auto" | "manual" = "manual"

  isHistoryPanelOpen = false

  /**
   * Make this class observable
   */
  constructor() {
    makeAutoObservable(this)
  }

  /**
   * Open tool and set it as active tool while save the previous tool as history
   *
   * @param tool
   */
  openTool(tool: Tool) {
    if (this.getActiveTool().id !== tool.id) {
      this.saveActiveToolStateToHistory()
      this.activeTool = tool.openTool()
    }
  }

  openToolFromViewedHistory() {
    const toolHistory = this.getActiveTool()
    const mainTool = mapOfTool[toolHistory.toolId]
    if (toolHistory) {
      this.activeTool = Tool.openFromHistory(mainTool, toolHistory)
    }
  }

  /**
   * Open history of tool and save the previous tool as history
   *
   * @param toolHistory
   */
  openHistory(toolHistory: ToolHistory) {
    const mainTool = mapOfTool[toolHistory.toolId]
    if (mainTool) {
      this.saveActiveToolStateToHistory()
      this.activeTool = Tool.fromHistory(mainTool, toolHistory)
    }
  }

  /**
   * Save previous tool to history if acceptable
   */
  saveActiveToolStateToHistory() {
    const activeTool = this.activeTool

    if (activeTool && activeTool.getIsDirty() && !activeTool.isReadOnly) {
      const lastToolHistory = toolHistoryStore.getWithToolId(activeTool.toolId)[0]
      if (lastToolHistory) {
        const activeToolState = this.getInputAndOutputState(activeTool)
        const activeToolStateState = this.getInputAndOutputState(lastToolHistory)

        if (activeToolState === activeToolStateState) return
      }

      toolHistoryStore.add(activeTool.toHistory())
    }
  }

  getInputAndOutputState(tool: Tool | ToolHistory) {
    return Object.values(tool.inputParams).concat(Object.values(tool.outputParams)).toString().trim()
  }

  /**
   * Get current active tool, or return empty if there is not active tool
   *
   * @returns Tool
   */
  getActiveTool() {
    const currentTool = this.activeTool
    if (currentTool) return currentTool
    const defaultTool = new Tool({
      name: "",
      action: () => ({}),
      inputs: [],
      outputs: [],
      id: "",
      category: ""
    })

    return defaultTool
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
    return this.runMode === "auto"
  }

  /**
   * Check whether passed tool in arguments is currently active
   *
   * @param tool
   * @returns
   */
  isToolActive(tool: Tool | ToolHistory) {
    return this.getActiveTool().id === tool.id
  }

  runActiveTool() {
    this.getActiveTool().run()
    if (!this.isRunModeAuto) {
      this.saveActiveToolStateToHistory()
    }
  }

  toggleHistoryPanel() {
    this.isHistoryPanelOpen = !this.isHistoryPanelOpen
  }
}

export const toolStore = new ToolStore()
