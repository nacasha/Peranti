import { useStore } from "@nanostores/react"
import { appWindow } from "@tauri-apps/api/window"
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
import { AppTitleBarStyle } from "src/enums/app-titlebar-style"
import { useDragAndDropJS } from "src/hooks/useDragAndDropJS"
import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletStore } from "src/services/applet-store"
import { hotkeysStore } from "src/services/hotkeys-store"
import { interfaceStore } from "src/services/interface-store"
import { sessionHistoryStore } from "src/services/session-history-store"
import { sessionStore } from "src/services/session-store"
import { type Session } from "src/types/Session"

import "./SessionTabbar.scss"

const $renamingSessionId = atom<string>("")

export const SessionTabbar: FC = observer(() => {
  const activeApplet = activeAppletStore.getActiveApplet()
  const sessions = sessionStore.getRunningSessions(activeApplet.appletId)
  const activeIndex = sessions.findIndex((tab) => tab.sessionId === activeApplet.sessionId)
  const appTitlebarStyle = interfaceStore.appTitlebarStyle

  const ref = useRef<HTMLDivElement>(null)

  const isAppletActive = (session: Session) => (
    session.sessionId === activeApplet.sessionId
  )

  const onClickAddTab = () => {
    sessionStore.createSession(activeApplet, undefined, true)
  }

  useHotkeysModified(hotkeysStore.keys.TAB_NEW_EDITOR, (event) => {
    event.preventDefault()
    sessionStore.createSession(activeApplet, undefined)
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_NEXT, (event) => {
    event.preventDefault()
    const nextActiveIndex = activeIndex + 1
    let session
    if (nextActiveIndex > sessions.length - 1) {
      session = sessions[0]
    } else {
      session = sessions[nextActiveIndex]
    }

    void sessionStore.openSession(session)
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_PREV, (event) => {
    event.preventDefault()
    const nextActiveIndex = activeIndex - 1
    let session
    if (nextActiveIndex < 0) {
      session = sessions[sessions.length - 1]
    } else {
      session = sessions[nextActiveIndex]
    }

    void sessionStore.openSession(session)
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CLOSE, (event) => {
    event.preventDefault()
    void sessionStore.closeSession(activeApplet.toSession())
  })

  useHotkeysModified(hotkeysStore.keys.RESTORE_CLOSED_TAB, (event) => {
    event?.preventDefault()
    void sessionHistoryStore.restoreLastHistory()
  })

  useHotkeysModified(hotkeysStore.keys.RENAME_ACTIVE_TAB, (event) => {
    event?.preventDefault()
    $renamingSessionId.set(activeApplet.sessionId)
  })

  useEffect(() => {
    if (ref.current) {
      const handleScroll = (event: WheelEvent) => {
        if (ref.current) {
          event.preventDefault()
          ref.current.scrollLeft += event.deltaY
        }
      }

      const handleDragWindow = (event: MouseEvent) => {
        if (appTitlebarStyle === AppTitleBarStyle.Tabbar) {
          const target = event.target as HTMLDivElement | null

          if (target?.classList.contains("simplebar-content")) {
            void appWindow.startDragging()

            if (event.detail === 2) {
              void appWindow.toggleMaximize()
            }
          }
        }
      }

      ref.current.addEventListener("wheel", handleScroll)
      ref.current.addEventListener("mousedown", handleDragWindow)

      return () => {
        ref.current?.removeEventListener("wheel", handleScroll)
        ref.current?.removeEventListener("mousedown", handleDragWindow)
      }
    }
  }, [ref, appTitlebarStyle])

  return (
    <>
      <div className="SessionTabbar-window-drag" data-tauri-drag-region></div>

      <div className="SessionTabbar">
        <div className="SessionTabbar-inner">
          <SimpleBar
            className="SessionTabbar-inner-simplebar"
            scrollableNodeProps={{ ref }}
          >
            {sessions.map((session) => (
              <TabItem
                key={session.sessionId.concat(session.sessionName ?? "")}
                session={session}
                active={isAppletActive(session)}
              />
            ))}

            {!(activeApplet.appletId === "") && (
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
  session: Session
  active: boolean
}

interface MenuParams {
  session: Session
}

type TabbarContextMenuItemParams = ItemParams<MenuParams>

const TabbarContextMenu: FC = () => {
  const handleCloseAllSession = () => {
    sessionStore.closeAllSession()
  }

  const handleCloseSession = (itemParams: TabbarContextMenuItemParams) => {
    const { session } = itemParams.props ?? {}
    if (session) {
      void sessionStore.closeSession(session)
    }
  }

  const handleCloseOtherSession = (itemParams: TabbarContextMenuItemParams) => {
    const { session } = itemParams.props ?? {}
    if (session) {
      void sessionStore.closeOtherSession(session)
    }
  }

  const handleRenameSession = (itemParams: TabbarContextMenuItemParams) => {
    const { session } = itemParams.props ?? {}
    if (session) {
      $renamingSessionId.set(session.sessionId)
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
  const { session, active } = props
  const { sessionId, sessionName, sessionSequenceNumber, appletId, isActionRunning } = session
  const renamingSessionId = useStore($renamingSessionId)
  const isRenamingSession = useMemo(() => renamingSessionId === sessionId, [renamingSessionId])
  const tabLabelRef = useRef<HTMLDivElement>(null)

  const { show } = useContextMenu()

  const getSessionName = () => {
    if (sessionName) return sessionName
    return appletStore.mapOfLoadedAppletsName[appletId]?.concat(`-${sessionSequenceNumber}`)
  }

  const handleMouseDown: MouseEventHandler = (event) => {
    if (event.button === 0) {
      const clickedElement = event.target as HTMLDivElement
      if (clickedElement.tagName.toLowerCase() === "img" ||
        clickedElement.classList.contains("SessionTabbar-icon")) {
        event.stopPropagation()
        event.preventDefault()
        return
      }

      void sessionStore.openSession(session)
    } else if (event.button === 1) {
      event.preventDefault()
    }
  }

  const handleMouseUp: MouseEventHandler = (event) => {
    if (event.button === 1) {
      void sessionStore.closeSession(session)
    }
  }

  const handleContextMenu: MouseEventHandler = (event) => {
    show({
      event,
      id: ContextMenuKeys.SessionTabbar,
      props: { session }
    })
  }

  const handleCloseTab: MouseEventHandler = (event) => {
    event.stopPropagation()
    void sessionStore.closeSession(session)
  }

  useEffect(() => {
    if (active && draggableElementRef.current) {
      draggableElementRef.current.scrollIntoView()
    }
  }, [active])

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

  const handleSessionNameInputBlur: FocusEventHandler<HTMLDivElement> = () => {
    $renamingSessionId.set("")

    if (tabLabelRef.current) {
      const tabLabel = tabLabelRef.current.innerText

      if (tabLabel !== getSessionName()) {
        void sessionStore.renameSession(session, tabLabel)
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
      key={session.sessionId.concat(session.sessionName ?? "")}
    >
      <div ref={draggableElementPlaceholderRef}></div>
      <div
        ref={draggableElementRef}
        key={session.sessionId}
        className={clsx("SessionTabbar-item", { active })}
        data-session-id={session.sessionId}
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
    prevProps.session.isActionRunning === nextProps.session.isActionRunning &&
    prevProps.session.sessionName === nextProps.session.sessionName &&
    prevProps.session.sessionSequenceNumber === nextProps.session.sessionSequenceNumber
})
