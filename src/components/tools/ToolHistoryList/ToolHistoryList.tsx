import { clsx } from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"

import { toolHistoryStore } from "src/stores/toolHistoryStore"
import { toolStore } from "src/stores/toolStore"
import { mapOfToolsName } from "src/tools"
import { type ToolHistory } from "src/types/ToolHistory"
import { prettyDateFormat } from "src/utils/prettyDateFormat"

import "./ToolHistoryList.scss"

interface ToolHistoryListProps {
  showAllHistory?: boolean
}

export const ToolHistoryList: FC<ToolHistoryListProps> = observer((props) => {
  const { showAllHistory } = props
  const activeTool = toolStore.getActiveTool()

  const onClickItem = (toolHistory: ToolHistory) => () => {
    toolStore.openHistory(toolHistory)
  }

  return (
    <div className={clsx("ToolPage-right-panel", toolStore.isHistoryPanelOpen && "open")}>
      <div className="ToolHistoryList">
        {(showAllHistory ? toolHistoryStore.history : toolHistoryStore.getWithToolId(activeTool.toolId)).map((toolHistory) => (
          <div
            key={toolHistory.instanceId}
            className={clsx("ToolHistoryList-item", toolStore.isToolActive(toolHistory) && "active")}
            onClick={onClickItem(toolHistory)}
          >
            <div>{mapOfToolsName[toolHistory.toolId]}</div>
            <div className="subtitle">{prettyDateFormat(new Date(toolHistory.createdAt))}</div>
          </div>
        ))}
      </div>
    </div>
  )
})
