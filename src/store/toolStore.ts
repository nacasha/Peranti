import { makeAutoObservable } from "mobx"
import { Tool } from "src/models/Tool"
import { toolHistoryStore } from "./toolHistoryStore"

class ToolStore {
  protected activeTool?: Tool = undefined

  constructor() {
    makeAutoObservable(this)
  }

  setActiveTool(tool: Tool) {
    this.savePreviousToolToHistory()
    this.activeTool = tool.openTool()
  }

  savePreviousToolToHistory() {
    if (this.activeTool && this.activeTool.getIsDirty() && !this.activeTool.isHistory) {
      this.activeTool.stateToHistory()
      toolHistoryStore.add(this.activeTool)
    }
  }

  getActiveTool() {
    const currentTool = this.activeTool
    if (currentTool) return currentTool
    const defaultTool = new Tool({
      title: "",
      action: () => ({}),
      inputs: [],
      outputs: [],
      id: "",
      category: ""
    })

    return defaultTool
  }

  getActiveToolTitle() {
    return this.getActiveTool().title
  }

  isToolActive(tool: Tool) {
    return this.getActiveTool().id === tool.id
  }
}

export const toolStore = new ToolStore()
