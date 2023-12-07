import { makeAutoObservable } from "mobx"
import { type Tool } from "src/models/Tool"

class ToolHistoryStore {
  history: Tool[] = []

  constructor() {
    makeAutoObservable(this)
  }

  add(tool: Tool) {
    this.history.unshift(tool)
  }
}

export const toolHistoryStore = new ToolHistoryStore()
