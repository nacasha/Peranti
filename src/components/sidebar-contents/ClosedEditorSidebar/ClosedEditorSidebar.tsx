import { observer } from "mobx-react"
import { type FC } from "react"

import { useSelector } from "src/hooks/useSelector"
import { activeSessionStore } from "src/stores/activeSessionStore"
import { sessionHistoryStore } from "src/stores/sessionHistoryStore"
import { toolStore } from "src/stores/toolStore"
import { type SessionHistory } from "src/types/SessionHistory"

import { ToolSidebarItem } from "../ToolSidebarItem"

import "./ClosedEditorSidebar.scss"

export const ClosedEditorSidebar: FC = observer(() => {
  const activeSessionId = useSelector(() => activeSessionStore.getActiveTool().sessionId)
  const closedEditorList = useSelector(() => sessionHistoryStore.histories)

  const onClickItem = (toolHistory: SessionHistory) => () => {
    void sessionHistoryStore.openHistory(toolHistory)
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
})
