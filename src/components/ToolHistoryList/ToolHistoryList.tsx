import { observer } from "mobx-react"
import { toolHistoryStore } from "src/store/toolHistoryStore"

import "./ToolHistoryList.scss"
import { toolStore } from "src/store/toolStore"
import { type ToolHistory } from "src/types/ToolHistory"

export const ToolHistoryList = observer(() => {
  const onClickItem = (toolHistory: ToolHistory) => () => {
    toolStore.openHistory(toolHistory)
  }

  return (
    <div className="ToolHistoryList">
      {toolHistoryStore.history.map((toolHistory) => (
        <div
          key={toolHistory.id}
          className="ToolHistoryList-item"
          onClick={onClickItem(toolHistory)}
        >
          {toolHistory.id} - {toolHistory.toolId}
        </div>
      ))}
    </div>
  )
})
