import { observer } from "mobx-react"
import { toolHistoryStore } from "src/store/toolHistoryStore"

import "./ToolHistoryList.scss"
import { toolStore } from "src/store/toolStore"
import { type ToolHistory } from "src/types/ToolHistory"
import { prettyDateFormat } from "src/utils/prettyDateFormat"

export const ToolHistoryList = observer(() => {
  const activeTool = toolStore.getActiveTool()

  const onClickItem = (toolHistory: ToolHistory) => () => {
    toolStore.openHistory(toolHistory)
  }

  return (
    <div className={"ToolView-left-panel".concat(toolStore.isHistoryPanelOpen ? " open" : "")}>
      <div className="ToolHistoryList">
        {toolHistoryStore.getWithToolId(activeTool.toolId).map((toolHistory) => (
          <div
            key={toolHistory.instanceId}
            className={"ToolHistoryList-item".concat(toolStore.isToolActive(toolHistory) ? " active" : "")}
            onClick={onClickItem(toolHistory)}
          >
            {prettyDateFormat(new Date(toolHistory.createdAt))}
          </div>
        ))}
      </div>
    </div>
  )
})
