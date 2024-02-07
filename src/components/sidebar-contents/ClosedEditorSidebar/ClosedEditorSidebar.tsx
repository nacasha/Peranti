import { observer } from "mobx-react"
import { type FC } from "react"

import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletStore } from "src/services/applet-store"
import { sessionHistoryStore } from "src/services/session-history-store"
import { type SessionHistory } from "src/types/SessionHistory"

import { ToolSidebarItem } from "../ToolSidebarItem"

import "./ClosedEditorSidebar.scss"

export const ClosedEditorSidebar: FC = observer(() => {
  const activeSessionId = useSelector(() => activeAppletStore.getActiveApplet().sessionId)
  const closedEditorList = useSelector(() => sessionHistoryStore.histories)

  const onClickItem = (sessionHistory: SessionHistory) => () => {
    void sessionHistoryStore.openHistory(sessionHistory)
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
                {appletStore.mapOfLoadedAppletsName[toolHistory.toolId]}
              </div>
            </div>
          </ToolSidebarItem>
        ))}
      </div>
    </div>
  )
})
