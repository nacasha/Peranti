import { appWindow } from "@tauri-apps/api/window"
import { observer } from "mobx-react"
import { atom } from "nanostores"
import { type FC, useEffect, useRef } from "react"
import SimpleBar from "simplebar-react"

import { WindowControls } from "src/components/window/WindowControls"
import { Icons } from "src/constants/icons"
import { AppTitleBarStyle } from "src/enums/app-titlebar-style"
import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { activeAppletStore } from "src/services/active-applet-store"
import { hotkeysStore } from "src/services/hotkeys-store"
import { interfaceStore } from "src/services/interface-store"
import { sessionHistoryStore } from "src/services/session-history-store"
import { sessionStore } from "src/services/session-store"
import { type Session } from "src/types/Session"

import { sessionTabbarClasses } from "./SessionTabbar.css"
import { SessionTabbarContextMenu } from "./SessionTabbarContextMenu.tsx"
import { SessionTabbarItem } from "./SessionTabbarItem.tsx"

const $renamingSessionId = atom<string>("")

export const SessionTabbar: FC = observer(() => {
  const activeApplet = activeAppletStore.getActiveApplet()
  const sessions = sessionStore.getRunningSessions(activeApplet.appletId)
  const activeIndex = sessions.findIndex((tab) => tab.sessionId === activeApplet.sessionId)
  const appTitlebarStyle = interfaceStore.appTitlebarStyle

  const scrollBarRef = useRef<HTMLDivElement>(null)

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
    if (scrollBarRef.current) {
      const handleScroll = (event: WheelEvent) => {
        if (scrollBarRef.current) {
          event.preventDefault()
          scrollBarRef.current.scrollLeft += event.deltaY
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

      scrollBarRef.current.addEventListener("wheel", handleScroll)
      scrollBarRef.current.addEventListener("mousedown", handleDragWindow)

      return () => {
        scrollBarRef.current?.removeEventListener("wheel", handleScroll)
        scrollBarRef.current?.removeEventListener("mousedown", handleDragWindow)
      }
    }
  }, [scrollBarRef, appTitlebarStyle])

  return (
    <>
      <div className={sessionTabbarClasses.windowExtraDrag} data-tauri-drag-region></div>

      <div className={sessionTabbarClasses.root}>
        <div className={sessionTabbarClasses.rootBorderBottom} data-tauri-drag-region />

        <div className={sessionTabbarClasses.inner}>
          <SimpleBar
            className={sessionTabbarClasses.innerSimplebar}
            scrollableNodeProps={{ ref: scrollBarRef }}
          >
            {sessions.map((session) => (
              <SessionTabbarItem
                key={session.sessionId.concat(session.sessionName ?? "")}
                session={session}
                active={isAppletActive(session)}
              />
            ))}

            {!(activeApplet.appletId === "") && (
              <div onClick={onClickAddTab} className={sessionTabbarClasses.itemNew}>
                <div className={sessionTabbarClasses.itemSessionIcon}>
                  <img src={Icons.Plus} alt="Add Tab" />
                </div>
              </div>
            )}
          </SimpleBar>
        </div>

        {appTitlebarStyle === AppTitleBarStyle.Tabbar && <WindowControls />}
      </div>

      <SessionTabbarContextMenu />
    </>
  )
})
