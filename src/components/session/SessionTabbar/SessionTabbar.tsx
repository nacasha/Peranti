import { useStore } from "@nanostores/react"
import clsx from "clsx"
import { observer } from "mobx-react"
import { atom } from "nanostores"
import { type MouseEventHandler, type FC, useEffect, useRef, memo, type FocusEventHandler, useMemo } from "react"
import { type ItemParams, useContextMenu, Item, Separator } from "react-contexify"
import SimpleBar from "simplebar-react"

import { ContextMenu } from "src/components/common/ContextMenu"
import { WindowControls } from "src/components/window/WindowControls"
import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { Icons } from "src/constants/icons"
import { AppTitleBarStyle } from "src/enums/AppTitleBarStyle"
import { useDragAndDropJS } from "src/hooks/useDragAndDropJS"
import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { activeSessionStore } from "src/stores/activeSessionStore"
import { hotkeysStore } from "src/stores/hotkeysStore"
import { interfaceStore } from "src/stores/interfaceStore"
import { sessionStore } from "src/stores/sessionStore"
import { sessionHistoryStore } from "src/stores/sessionHistoryStore"
import { toolStore } from "src/stores/toolStore"
import { type Session } from "src/types/Session"

import "./SessionTabbar.scss"

const $renamingSessionId = atom<string>("")

export const SessionTabbar: FC = observer(() => {
  const activeTool = activeSessionStore.getActiveTool()
  const sessions = sessionStore.getRunningSessions(activeTool.toolId)
  const activeIndex = sessions.findIndex((tab) => tab.sessionId === activeTool.sessionId)
  const appTitlebarStyle = interfaceStore.appTitlebarStyle

  const ref = useRef<HTMLDivElement>(null)

  const isToolActive = (session: Session) => (
    session.sessionId === activeTool.sessionId
  )

  const onClickAddTab = () => {
    sessionStore.createSession(activeTool, undefined, true)
  }

  useHotkeysModified(hotkeysStore.keys.TAB_NEW_EDITOR, (event) => {
    event.preventDefault()
    sessionStore.createSession(activeTool, undefined)
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_NEXT, (event) => {
    event.preventDefault()
    const nextActiveIndex = activeIndex + 1
    let toolSession
    if (nextActiveIndex > sessions.length - 1) {
      toolSession = sessions[0]
    } else {
      toolSession = sessions[nextActiveIndex]
    }

    void sessionStore.openSession(toolSession)
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_PREV, (event) => {
    event.preventDefault()
    const nextActiveIndex = activeIndex - 1
    let toolSession
    if (nextActiveIndex < 0) {
      toolSession = sessions[sessions.length - 1]
    } else {
      toolSession = sessions[nextActiveIndex]
    }

    void sessionStore.openSession(toolSession)
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CLOSE, (event) => {
    event.preventDefault()
    void sessionStore.closeSession(activeTool.toSession())
  })

  useHotkeysModified(hotkeysStore.keys.RESTORE_CLOSED_TAB, (event) => {
    event?.preventDefault()
    void sessionHistoryStore.restoreLastHistory()
  })

  useHotkeysModified(hotkeysStore.keys.RENAME_ACTIVE_TAB, (event) => {
    event?.preventDefault()
    $renamingSessionId.set(activeTool.sessionId)
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
    <>
      <div className="SessionTabbar" data-tauri-drag-region>
        <div className="SessionTabbar-inner">
          <SimpleBar
            className="SessionTabbar-inner-simplebar"
            scrollableNodeProps={{ ref }}
          >
            {sessions.map((toolSession) => (
              <TabItem
                key={toolSession.sessionId.concat(toolSession.sessionName ?? "")}
                toolSession={toolSession}
                active={isToolActive(toolSession)}
              />
            ))}

            {!(activeTool.toolId === "") && (
              <div onClick={onClickAddTab} className="SessionTabbar-item new">
                <div className="SessionTabbar-icon">
                  <img src={Icons.Plus} alt="Add Tab" />
                </div>
              </div>
            )}
          </SimpleBar>
        </div>

        {appTitlebarStyle === AppTitleBarStyle.Tabbar && <WindowControls />}
      </div>

      <TabbarContextMenu />
    </>
  )
})

interface TabItemProps {
  toolSession: Session
  active: boolean
}

interface MenuParams {
  toolSession: Session
}

type TabbarContextMenuItemParams = ItemParams<MenuParams>

const TabbarContextMenu: FC = () => {
  const handleCloseAllSession = () => {
    sessionStore.closeAllSession()
  }

  const handleCloseSession = (itemParams: TabbarContextMenuItemParams) => {
    const { toolSession } = itemParams.props ?? {}
    if (toolSession) {
      void sessionStore.closeSession(toolSession)
    }
  }

  const handleCloseOtherSession = (itemParams: TabbarContextMenuItemParams) => {
    const { toolSession } = itemParams.props ?? {}
    if (toolSession) {
      void sessionStore.closeOtherSession(toolSession)
    }
  }

  const handleRenameSession = (itemParams: TabbarContextMenuItemParams) => {
    const { toolSession } = itemParams.props ?? {}
    if (toolSession) {
      $renamingSessionId.set(toolSession.sessionId)
    }
  }

  return (
    <ContextMenu id={ContextMenuKeys.SessionTabbar}>
      <Item
        id="copy"
        onClick={handleCloseSession}
      >
        Close
      </Item>
      <Item
        id="paste"
        onClick={handleCloseOtherSession}
      >
        Close Others
      </Item>
      <Item
        id="pick-from-file"
        onClick={handleCloseAllSession}
      >
        Close All
      </Item>
      <Separator />
      <Item
        id="save-to-file"
        onClick={handleRenameSession}
      >
        Raname
      </Item>
    </ContextMenu>
  )
}

const TabItem: FC<TabItemProps> = memo((props) => {
  const { toolSession, active } = props
  const { sessionId, sessionName, sessionSequenceNumber, toolId, isActionRunning } = toolSession
  const renamingSessionId = useStore($renamingSessionId)
  const isRenamingSession = useMemo(() => renamingSessionId === sessionId, [renamingSessionId])
  const tabLabelRef = useRef<HTMLDivElement>(null)

  const { show } = useContextMenu()

  const getSessionName = () => {
    if (sessionName) return sessionName
    return toolStore.mapOfLoadedToolsName[toolId]?.concat(`-${sessionSequenceNumber}`)
  }

  const handleMouseDown: MouseEventHandler = (event) => {
    if (event.button === 0) {
      /**
       * Dont open the session when user click on close button
       */
      const clickedElement = event.target as HTMLDivElement
      if (clickedElement.tagName.toLowerCase() === "img" ||
        clickedElement.classList.contains("SessionTabbar-icon")) {
        event.stopPropagation()
        event.preventDefault()
        return
      }

      void sessionStore.openSession(toolSession)
    } else if (event.button === 1) {
      event.preventDefault()
    }
  }

  const handleMouseUp: MouseEventHandler = (event) => {
    if (event.button === 1) {
      void sessionStore.closeSession(toolSession)
    }
  }

  const handleContextMenu: MouseEventHandler = (event) => {
    show({
      event,
      id: ContextMenuKeys.SessionTabbar,
      props: { toolSession }
    })
  }

  const handleCloseTab: MouseEventHandler = (event) => {
    event.stopPropagation()
    void sessionStore.closeSession(toolSession)
  }

  /**
   * Scroll tool tabbar to this tab when active
   */
  useEffect(() => {
    if (active && draggableElementRef.current) {
      draggableElementRef.current.scrollIntoView()
    }
  }, [active])

  /**
   * Select all text when starting to rename this tab
   */
  useEffect(() => {
    if (isRenamingSession) {
      if (tabLabelRef.current) {
        tabLabelRef.current.focus()

        const range = document.createRange()
        range.selectNodeContents(tabLabelRef.current)
        const selection = window.getSelection()
        if (selection) {
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }
  }, [isRenamingSession])

  /**
   * Blur the input for renaming tab when user hit Enter
   */
  useEffect(() => {
    const { current: tabLabelInput } = tabLabelRef

    if (tabLabelInput) {
      const keyDownListener = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          tabLabelInput.blur()
        }
      }

      tabLabelInput.addEventListener("keydown", keyDownListener)
      return () => {
        tabLabelInput?.removeEventListener("keydown", keyDownListener)
      }
    }
  }, [tabLabelRef.current])

  /**
   * Rename session when rename tab input get blur event
   */
  const handleSessionNameInputBlur: FocusEventHandler<HTMLDivElement> = () => {
    $renamingSessionId.set("")

    if (tabLabelRef.current) {
      const tabLabel = tabLabelRef.current.innerText

      if (tabLabel !== getSessionName()) {
        void sessionStore.renameSession(toolSession, tabLabel)
      }
    }
  }

  const { draggableElementRef, draggableElementPlaceholderRef } = useDragAndDropJS({
    onMouseUp: (event) => {
      const elementBelowMouse = document.elementsFromPoint(event.clientX, event.clientY)
      const otherTabbar = elementBelowMouse.find((element) => (
        element.classList.contains("SessionTabbar-item") && !element.classList.contains("active")
      ))

      if (otherTabbar) {
        const targetSessionId = (otherTabbar as HTMLDivElement).getAttribute("data-session-id")
        if (targetSessionId) {
          sessionStore.switchSessionPosition(sessionId, targetSessionId)
        }
      }
    }
  })

  return (
    <div
      id={ContextMenuKeys.SessionTabbar}
      className="SessionTabbar-item-container"
      key={toolSession.sessionId.concat(toolSession.sessionName ?? "")}
    >
      <div ref={draggableElementPlaceholderRef}></div>
      <div
        ref={draggableElementRef}
        key={toolSession.sessionId}
        className={clsx("SessionTabbar-item", { active })}
        data-session-id={toolSession.sessionId}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        <div
          ref={tabLabelRef}
          className="SessionTabbar-item-label"
          contentEditable={isRenamingSession}
          onBlur={handleSessionNameInputBlur}
          suppressContentEditableWarning
        >
          {getSessionName()}
          {isActionRunning ? " ..." : ""}
        </div>
        <div className="SessionTabbar-icon" onClickCapture={handleCloseTab}>
          <img src={Icons.Close} alt="Close Tab" />
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.active === nextProps.active &&
    prevProps.toolSession.isActionRunning === nextProps.toolSession.isActionRunning &&
    prevProps.toolSession.sessionName === nextProps.toolSession.sessionName &&
    prevProps.toolSession.sessionSequenceNumber === nextProps.toolSession.sessionSequenceNumber
})
