import clsx from "clsx"
import { observer } from "mobx-react"
import { type MouseEventHandler, type FC, useEffect, useRef } from "react"
import SimpleBar from "simplebar-react"

import { icons } from "src/constants/icons"
import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { hotkeysStore } from "src/stores/hotkeysStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolSessionStore } from "src/stores/toolSessionStore"
import { toolStore } from "src/stores/toolStore"
import { type ToolSession } from "src/types/ToolSession"

import "./ToolTabbar.scss"

export const ToolTabbar: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()
  const tabs = toolSessionStore.getRunningSessions(activeTool.toolId)
  const activeIndex = tabs.findIndex((tab) => tab.sessionId === activeTool.sessionId)

  const ref = useRef<HTMLDivElement>(null)

  const isToolActive = (toolSession: ToolSession) => (
    toolSession.sessionId === activeTool.sessionId
  )

  const onClickAddTab = () => {
    const createdSession = toolSessionStore.createSession(activeTool, undefined, true)

    if (createdSession) {
      focusActiveTab(createdSession.sessionId)
    }
  }

  const focusActiveTab = (sessionId: string) => {
    const activeTab: HTMLDivElement | null = document.querySelector(`[data-session-id="${sessionId}"]`)
    if (activeTab) {
      activeTab.scrollIntoView()
    }
  }

  useHotkeysModified(hotkeysStore.keys.TAB_NEW_EDITOR, (event) => {
    event.preventDefault()
    const createdSession = toolSessionStore.createSession(activeTool, undefined)

    if (createdSession) {
      focusActiveTab(createdSession.sessionId)
    }
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_NEXT, (event) => {
    event.preventDefault()
    const nextActiveIndex = activeIndex + 1
    let toolSession
    if (nextActiveIndex > tabs.length - 1) {
      toolSession = tabs[0]
    } else {
      toolSession = tabs[nextActiveIndex]
    }

    void toolSessionStore.openSession(toolSession)
    focusActiveTab(toolSession.sessionId)
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_PREV, (event) => {
    event.preventDefault()
    const nextActiveIndex = activeIndex - 1
    let toolSession
    if (nextActiveIndex < 0) {
      toolSession = tabs[tabs.length - 1]
    } else {
      toolSession = tabs[nextActiveIndex]
    }

    void toolSessionStore.openSession(toolSession)
    focusActiveTab(toolSession.sessionId)
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CLOSE, (event) => {
    event.preventDefault()
    void toolSessionStore.closeSession(activeTool.toSession())
  })

  useEffect(() => {
    if (ref.current) {
      const onScroll = (event: WheelEvent) => {
        if (ref.current) {
          event.preventDefault()
          ref.current.scrollLeft += event.deltaY
        }
      }

      ref.current.addEventListener("wheel", onScroll)
      return () => {
        ref.current?.removeEventListener("wheel", onScroll)
      }
    }
  }, [ref])

  return (
    <div className="ToolTabbar">
      <div className="ToolTabbar-inner">
        <SimpleBar
          className="ToolTabbar-inner-simplebar"
          scrollableNodeProps={{ ref }}
        >
          {tabs.map((toolSession) => (
            <TabItem
              key={toolSession.sessionId}
              toolSession={toolSession}
              active={isToolActive(toolSession)}
            />
          ))}

          <div onClick={onClickAddTab} className="ToolTabbar-item new">
            <div className="ToolTabbar-icon"><img src={icons.Plus} alt="Add Tab" /></div>
          </div>
        </SimpleBar>
      </div>
    </div>
  )
})

interface TabItemProps {
  toolSession: ToolSession
  active: boolean
}

const TabItem: FC<TabItemProps> = (props) => {
  const { toolSession, active } = props

  const onClickTab = () => {
    void toolSessionStore.openSession(toolSession)
  }

  const onClickCloseTab: MouseEventHandler = (event) => {
    event.stopPropagation()
    void toolSessionStore.closeSession(toolSession)
  }

  useEffect(() => {
    if (active) {
      const activeTab: HTMLDivElement | null = document.querySelector(`[data-session-id="${toolSession.sessionId}"]`)
      if (activeTab) {
        activeTab.scrollIntoView()
      }
    }
  }, [active])

  const getSessionName = (toolSession: ToolSession) => {
    const { sessionName, sessionSequenceNumber, toolId } = toolSession

    if (sessionName) return sessionName
    return toolStore.mapOfLoadedToolsName[toolId].concat(` - ${sessionSequenceNumber}`)
  }

  return (
    <div
      key={toolSession.sessionId}
      className={clsx("ToolTabbar-item", { active })}
      onClick={onClickTab}
      data-session-id={toolSession.sessionId}
    >
      {getSessionName(toolSession)}
      {toolSession.isActionRunning ? " ..." : ""}
      <div className="ToolTabbar-icon" onClick={onClickCloseTab}>
        <img src={icons.Close} alt="Close Tab" />
      </div>
    </div>
  )
}
