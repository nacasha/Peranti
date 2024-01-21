import clsx from "clsx"
import { observer } from "mobx-react"
import { type MouseEventHandler, type FC } from "react"

import { assets } from "src/constants/assets"
import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { hotkeysStore } from "src/stores/hotkeysStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolSessionStore } from "src/stores/toolSessionStore"
import { type ToolSession } from "src/types/ToolIdle"

import "./ToolTabbar.scss"

export const ToolTabbar: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()
  const tabs = toolSessionStore.getRunningSessionsFromTool(activeTool.toolId)
  const activeIndex = tabs.findIndex((tab) => tab.sessionId === activeTool.sessionId)

  const isToolActive = (toolSession: ToolSession) => (
    toolSession.sessionId === activeTool.sessionId
  )

  const onClickTab = (toolSession: ToolSession) => () => {
    toolSessionStore.openSession(toolSession)
  }

  const onClickAddTab = () => {
    toolSessionStore.createSession(activeTool)
  }

  const onClickCloseTab = (toolSession: ToolSession): MouseEventHandler => (event) => {
    event.stopPropagation()
    toolSessionStore.closeSession(toolSession)
  }

  useHotkeysModified(hotkeysStore.keys.TAB_NEW_EDITOR, (event) => {
    event.preventDefault()
    onClickAddTab()
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_NEXT, (event) => {
    event.preventDefault()
    const nextActiveIndex = activeIndex + 1
    if (nextActiveIndex > tabs.length - 1) {
      toolSessionStore.openSession(tabs[0])
    } else {
      toolSessionStore.openSession(tabs[nextActiveIndex])
    }
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_NEXT, (event) => {
    event.preventDefault()
    const nextActiveIndex = activeIndex + 1
    if (nextActiveIndex > tabs.length - 1) {
      toolSessionStore.openSession(tabs[0])
    } else {
      toolSessionStore.openSession(tabs[nextActiveIndex])
    }
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CLOSE, (event) => {
    event.preventDefault()
    toolSessionStore.closeSession(activeTool.toSession())
  })

  return (
    <div className="ToolTabbar">
      <div className="ToolTabbar-inner">
        {tabs.map((tool) => (
          <div
            key={tool.sessionId}
            className={clsx("ToolTabbar-item", { active: isToolActive(tool) })}
            onClick={onClickTab(tool)}
          >
            {tool.sessionName}
            {tool.isActionRunning ? " ..." : ""}
            <div className="ToolTabbar-icon" onClick={onClickCloseTab(tool)}>
              <img src={assets.CloseSVG} alt="Close Tab" />
            </div>
          </div>
        ))}

        <div onClick={onClickAddTab} className="ToolTabbar-item new">
          <div className="ToolTabbar-icon"><img src={assets.PlusSVG} alt="Add Tab" /></div>
        </div>
      </div>
    </div>
  )
})
