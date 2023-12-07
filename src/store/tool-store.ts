import { createStore } from "@udecode/zustood"
import { type Tool } from "src/types/Tool"
import { listOfTools } from "src/tools"

const defaultTool: Tool = {
  title: "",
  action: () => ({}),
  inputs: [],
  outputs: [],
  id: "",
  category: ""
}

const toolStore = createStore("tool")({
  tools: listOfTools,
  currentTool: undefined as undefined | Tool
})
  .extendSelectors((_set, get) => ({
    currentToolOrEmpty: () => {
      const currentTool = get.currentTool()
      if (currentTool) return currentTool
      return defaultTool
    }
  }))

export default toolStore
