import clsx from "clsx"
import { observer } from "mobx-react"
import { type MouseEventHandler, type FC, useEffect, useRef, type DragEventHandler } from "react"
import SimpleBar from "simplebar-react"

import { Icons } from "src/constants/icons"
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
    toolSessionStore.createSession(activeTool, undefined, true)
  }

  useHotkeysModified(hotkeysStore.keys.TAB_NEW_EDITOR, (event) => {
    event.preventDefault()
    toolSessionStore.createSession(activeTool, undefined)
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
            <div className="ToolTabbar-icon"><img src={Icons.Plus} alt="Add Tab" /></div>
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
  const { sessionId, sessionName, sessionSequenceNumber, toolId, isActionRunning } = toolSession

  const handleMouseDown: MouseEventHandler = (event) => {
    if (event.button === 0) {
      void toolSessionStore.openSession(toolSession)
    }
  }

  const handleMouseUp: MouseEventHandler = (event) => {
    if (event.button === 1) {
      void toolSessionStore.closeSession(toolSession)
    }
  }

  const onClickCloseTab: MouseEventHandler = (event) => {
    event.stopPropagation()
    void toolSessionStore.closeSession(toolSession)
  }

  const getSessionName = () => {
    if (sessionName) return sessionName
    return toolStore.mapOfLoadedToolsName[toolId]?.concat(`-${sessionSequenceNumber}`)
  }

  const handleDragStart: DragEventHandler<HTMLDivElement> = (event) => {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("sessionId", sessionId)
  }

  const handleDragOver: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    event.stopPropagation()

    const element = event.currentTarget
    if (element.classList.contains("droptarget")) {
      element.style.backdropFilter = "contrast(0.8)"
    }
  }

  const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    const element = event.currentTarget
    element.style.backdropFilter = "none"

    const fromSessionId = event.dataTransfer.getData("sessionId")
    toolSessionStore.switchSessionPosition(fromSessionId, sessionId)
  }

  const handleDragLeave: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    const element = event.currentTarget
    element.style.backdropFilter = "none"
  }

  useEffect(() => {
    if (active) {
      const activeTab: HTMLDivElement | null = document.querySelector(`[data-session-id="${sessionId}"]`)

      if (activeTab) {
        activeTab.scrollIntoView()
      }
    }
  }, [active])

  return (
    <div
      key={toolSession.sessionId}
      className={clsx("ToolTabbar-item", { active }, "droptarget")}
      data-session-id={toolSession.sessionId}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeaveCapture={handleDragLeave}
      onDrop={handleDrop}
      draggable
    >
      <div>
        {getSessionName()}
        {isActionRunning ? " ..." : ""}
      </div>
      <div className="ToolTabbar-icon" onClick={onClickCloseTab}>
        <img src={Icons.Close} alt="Close Tab" />
      </div>
    </div>
  )
}
