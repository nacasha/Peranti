import { makeAutoObservable } from "mobx"
import { type ToolHistory } from "src/types/ToolHistory"

class ToolHistoryStore {
  history: ToolHistory[] = []

  constructor() {
    makeAutoObservable(this)
  }

  add(toolHistory: ToolHistory) {
    this.history.unshift(toolHistory)
  }
}

export const toolHistoryStore = new ToolHistoryStore()
