import { makeAutoObservable } from "mobx"
import { Tool } from "src/models/Tool"
import { toolHistoryStore } from "./toolHistoryStore"
import { type ToolHistory } from "src/types/ToolHistory"
import { listOfTools } from "src/tools"

class ToolStore {
  protected activeTool?: Tool = undefined

  constructor() {
    makeAutoObservable(this)
  }

  openTool(tool: Tool) {
    if (this.getActiveTool().id !== tool.id) {
      this.savePreviousToolToHistory()
      this.activeTool = tool.openTool()
    }
  }

  openHistory(toolHistory: ToolHistory) {
    const tool = listOfTools.find((tool) => tool.id === toolHistory.toolId)
    if (tool) {
      this.activeTool = Tool.fromHistory(tool, toolHistory)
    }
  }

  savePreviousToolToHistory() {
    const activeTool = this.activeTool

    if (activeTool && activeTool.getIsDirty() && !activeTool.isReadOnly) {
      toolHistoryStore.add(activeTool.toHistory())
    }
  }

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

  getActiveToolName() {
    return this.getActiveTool().name
  }

  isToolActive(tool: Tool) {
    return this.getActiveTool().id === tool.id
  }
}

export const toolStore = new ToolStore()
