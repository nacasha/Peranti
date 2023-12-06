import { createStore } from '@udecode/zustood'
import { Tool } from '../types/Tool'
import { listOfTools } from '../tools'

const toolStore = createStore('tool')({
  tools: listOfTools,
  currentTool: undefined as undefined | Tool,
})
  .extendSelectors((_set, get) => ({
    currentToolOrEmpty: () => {
      const currentTool = get.currentTool();
      if (currentTool) return currentTool
      return { title: "", action: () => ({}), inputs: [], outputs: [], id: "", category: "" } as Tool
    },
  }))

export default toolStore
