import { useStore } from "@nanostores/react"
import clsx from "clsx"
import { atom } from "nanostores"
import { type MouseEventHandler, type FC, useEffect, useRef, type FocusEventHandler, useMemo } from "react"
import { useContextMenu } from "react-contexify"

import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { Icons } from "src/constants/icons"
import { useDragAndDropJS } from "src/hooks/useDragAndDropJS"
import { appletStore } from "src/services/applet-store"
import { sessionStore } from "src/services/session-store"
import { type Session } from "src/types/Session"

import { sessionTabbarClasses } from "./SessionTabbar.css"

const $renamingSessionId = atom<string>("")

interface TabItemProps {
  session: Session
  active: boolean
}

export const SessionTabbarItem: FC<TabItemProps> = (props) => {
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
        clickedElement.classList.contains(sessionTabbarClasses.itemSessionIcon)) {
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
        element.classList.contains(sessionTabbarClasses.itemSessionBody) && !element.classList.contains("active")
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
    <div className={sessionTabbarClasses.itemSession}>
      <div ref={draggableElementPlaceholderRef}></div>
      <div
        ref={draggableElementRef}
        key={session.sessionId}
        className={clsx(sessionTabbarClasses.itemSessionBody, { [sessionTabbarClasses.itemSessionActive]: active })}
        data-session-id={session.sessionId}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      >
        <div
          ref={tabLabelRef}
          className={sessionTabbarClasses.itemSessionLabel}
          contentEditable={isRenamingSession}
          onBlur={handleSessionNameInputBlur}
          suppressContentEditableWarning
        >
          {getSessionName()}
          {isActionRunning ? " ..." : ""}
        </div>
        <div className={sessionTabbarClasses.itemSessionIcon} onClickCapture={handleCloseTab}>
          <img src={Icons.Close} alt="Close Tab" />
        </div>
      </div>
    </div>
  )
}
