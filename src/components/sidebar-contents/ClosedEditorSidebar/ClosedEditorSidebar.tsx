import { type FC } from "react"

import { useSelector } from "src/hooks/useSelector"
import { toolHistoryStore } from "src/stores/toolHistoryStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolStore } from "src/stores/toolStore"
import { type ToolHistory } from "src/types/ToolHistory"

import { ToolSidebarItem } from "../ToolSidebarItem"

import "./ClosedEditorSidebar.scss"

export const ClosedEditorSidebar: FC = () => {
  const activeSessionId = useSelector(() => toolRunnerStore.getActiveTool().sessionId)
  const closedEditorList = useSelector(() => toolHistoryStore.histories)

  const onClickItem = (toolHistory: ToolHistory) => () => {
    void toolHistoryStore.openHistory(toolHistory)
  }

  return (
    <div className="ClosedEditorSidebar">
      <div className="PrimarySidebar-title">Closed Editor</div>

      <div className="ClosedEditorSidebar-main">
        {closedEditorList.map((toolHistory) => (
          <ToolSidebarItem
            key={toolHistory.sessionId}
            active={activeSessionId === toolHistory.sessionId}
            onClick={onClickItem(toolHistory)}
          >
            <div>
              <div className="title">
                {toolHistory.sessionName ?? "Untitled"}
              </div>
              <div className="subtitle">
                {toolStore.mapOfLoadedToolsName[toolHistory.toolId]}
              </div>
            </div>
          </ToolSidebarItem>
        ))}
      </div>
    </div>
  )
}
