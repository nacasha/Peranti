import clsx from "clsx"
import fastDeepEqual from "fast-deep-equal"
import { type MouseEventHandler, type FC, useEffect, useRef, type FocusEventHandler, memo } from "react"
import { useContextMenu } from "react-contexify"

import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { Icons } from "src/constants/icons"
import { useDragAndDropJS } from "src/hooks/useDragAndDropJS"
import { useSelector } from "src/hooks/useSelector.ts"
import { interfaceStore } from "src/services/interface-store"
import { sessionStore } from "src/services/session-store"
import { type Session } from "src/types/Session"
import { getSessionDisplayName } from "src/utils/applet/get-session-display-name"
import { getSessionIcon } from "src/utils/applet/get-session-icon"

interface TabItemProps {
  session: Session
}

export const SessionTabbarItem: FC<TabItemProps> = memo(({ session }) => {
  const { sessionId } = session
  const isRenamingSession = useSelector(() => sessionStore.renamingSessionId === session.sessionId)
  const isActive = useSelector(() => sessionStore.activeSessionId === session.sessionId)
  const isActionRunning = useSelector(() => sessionStore.sessions.find((s) => s.sessionId === session.sessionId)?.isActionRunning)
  const showTabIcon = useSelector(() => interfaceStore.showTabbarTabIcon)
  const tabLabelRef = useRef<HTMLDivElement>(null)

  const { show } = useContextMenu()

  const getSessionName = () => getSessionDisplayName(session)
  const SessionIcon = getSessionIcon(session)

  const handleMouseDown: MouseEventHandler = (event) => {
    if (event.button === 0) {
      // The close button (or the SVG/path inside it) handles its own click
      const clickedElement = event.target as Element
      if (clickedElement.closest(".SessionTabbar-item-session-icon")) {
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
    if (isActive && draggableElementRef.current) {
      draggableElementRef.current.scrollIntoView()
    }
  }, [isActive])

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
    sessionStore.setRenamingSessionId("")

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
        element.classList.contains("SessionTabbar-item-session-body") && !element.classList.contains("active")
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
    <div className="SessionTabbar-item-session">
      <div ref={draggableElementPlaceholderRef}></div>
      <div
        ref={draggableElementRef}
        key={session.sessionId}
        className={clsx("SessionTabbar-item-session-body", { active: isActive, running: isActionRunning })}
        data-session-id={session.sessionId}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        {showTabIcon && <SessionIcon size={14} className="SessionTabbar-item-session-type-icon" aria-hidden />}
        <div
          ref={tabLabelRef}
          className="SessionTabbar-item-session-label"
          contentEditable={isRenamingSession}
          onBlur={handleSessionNameInputBlur}
          suppressContentEditableWarning
        >
          {getSessionName()}
        </div>
        <div className="SessionTabbar-item-session-icon" onClickCapture={handleCloseTab}>
          {isActionRunning && (
            /**
             * Spun with SMIL rather than a CSS transform animation: in WebKit
             * the CSS one makes text elsewhere on the page flash when it starts
             */
            <svg
              className="SessionTabbar-item-session-spinner"
              width={12}
              height={12}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              aria-label="Running"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          )}
          <Icons.Close size={12} className="SessionTabbar-item-session-close" aria-label="Close Tab" />
        </div>
      </div>
    </div>
  )
}, fastDeepEqual)
