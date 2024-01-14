import { clsx } from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"

import { AppSidebarContentItem } from "src/components/app/AppSidebarContentItem"
import { toolHistoryStore } from "src/stores/toolHistoryStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolStore } from "src/stores/toolStore"
import { type ToolHistory } from "src/types/ToolHistory"
import { prettyDateFormat } from "src/utils/prettyDateFormat"

import "./ToolHistoryList.scss"

interface ToolHistoryListProps {
  showAllHistory?: boolean
}

export const ToolHistoryList: FC<ToolHistoryListProps> = observer((props) => {
  const { showAllHistory } = props
  const activeTool = toolRunnerStore.getActiveTool()

  const onClickItem = (toolHistory: ToolHistory) => () => {
    toolHistoryStore.openHistory(toolHistory)
  }

  return (
    <div className={clsx("ToolPage-right-panel", toolRunnerStore.isHistoryPanelOpen && "open")}>
      <div className="ToolHistoryList">
        {(showAllHistory ? toolHistoryStore.history : toolHistoryStore.getHistoryOfToolId(activeTool.toolId)).map((toolHistory) => (
          <AppSidebarContentItem
            key={toolHistory.sessionId}
            active={toolRunnerStore.isToolActiveBySessionId(toolHistory)}
            onClick={onClickItem(toolHistory)}
          >
            <div>{toolStore.mapOfToolsName[toolHistory.toolId]}</div>
            <div className="subtitle">{prettyDateFormat(new Date(toolHistory.createdAt))}</div>
          </AppSidebarContentItem>
        ))}
      </div>
    </div>
  )
})
