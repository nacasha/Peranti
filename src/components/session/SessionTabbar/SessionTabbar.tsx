import { observer } from "mobx-react"
import { type FC, useEffect, useRef, type CSSProperties, memo } from "react"
import SimpleBar from "simplebar-react"

import { Tooltip } from "src/components/common/Tooltip/Tooltip.tsx"
import { WindowControls } from "src/components/window/WindowControls"
import { Icons } from "src/constants/icons"
import { AppTitleBarStyle } from "src/enums/app-titlebar-style"
import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { useSelector } from "src/hooks/useSelector.ts"
import { activeAppletStore } from "src/services/active-applet-store"
import { hotkeysStore } from "src/services/hotkeys-store"
import { interfaceStore } from "src/services/interface-store"
import { sessionHistoryStore } from "src/services/session-history-store"
import { sessionStore } from "src/services/session-store"
import { windowManager } from "src/services/window-manager.ts"

import { SessionTabbarContextMenu } from "./SessionTabbarContextMenu.tsx"
import { SessionTabbarItem } from "./SessionTabbarItem.tsx"

import "./SessionTabbar.scss"

export const SessionTabbar: FC = () => {
  const appTitlebarStyle = useSelector(() => interfaceStore.appTitlebarStyle)
  const scrollBarRef = useRef<HTMLDivElement>(null)

  useHotkeysModified(hotkeysStore.keys.TAB_NEW_EDITOR, (event) => {
    event.preventDefault()
    sessionStore.createSessionOfActiveApplet()
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_NEXT, (event) => {
    event.preventDefault()
    sessionStore.openNextSessionOfActiveSession()
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_PREV, (event) => {
    event.preventDefault()
    sessionStore.openPreviousSessionOfActiveSession()
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CLOSE, (event) => {
    event.preventDefault()
    void sessionStore.closeSessionOfActiveApplet()
  })

  useHotkeysModified(hotkeysStore.keys.RESTORE_CLOSED_TAB, (event) => {
    event.preventDefault()
    void sessionHistoryStore.restoreLastHistory()
  })

  useHotkeysModified(hotkeysStore.keys.RENAME_ACTIVE_TAB, (event) => {
    event.preventDefault()
    sessionStore.setRenamingSessionIdOfActiveApplet()
  })

  useHotkeysModified(hotkeysStore.keys.PREVIOUS_SESSION, (event) => {
    event.preventDefault()
    void sessionStore.openPreviousLastActiveSession()
  })

  useHotkeysModified(hotkeysStore.keys.NEXT_SESSION, (event) => {
    event.preventDefault()
    void sessionStore.openNextLastActiveSession()
  })

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 3) {
        event.preventDefault()
        void sessionStore.openPreviousLastActiveSession()
      } else if (event.button === 4) {
        event.preventDefault()
        void sessionStore.openNextLastActiveSession()
      }
    }

    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

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
            void windowManager.startDragging()

            if (event.detail === 2) {
              void windowManager.toggleMaximize()
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
    <div className="SessionTabbar">
      {/* Below component was outside the root */}
      <div className="SessionTabbar-window-extra-drag" data-tauri-drag-region></div>
      <div className="SessionTabbar-border-bottom" data-tauri-drag-region />

      <div className="SessionTabbar-inner">
        <TabbarActions />

        <div className="SessionTabbar-inner-body" data-tauri-drag-region>
          <div className="SessionTabbar-inner-simplebar">
            <SimpleBar
              style={{ width: "100%" }}
              scrollableNodeProps={{ ref: scrollBarRef }}
            >
              <TabbarList />
              <div className="SessionTabbar-inner-simplebar-border-right"></div>
            </SimpleBar>
          </div>
        </div>
      </div>

      {appTitlebarStyle === AppTitleBarStyle.Tabbar && <WindowControls />}
      <SessionTabbarContextMenu />
    </div>
  )
}

const TabbarList = observer(() => {
  const sessions = sessionStore.getRunningSessionOfActiveApplet()

  return (
    <div className="SessionTabbarList">
      {sessions.map((session) => (
        <SessionTabbarItem
          key={session.sessionId.concat(session.sessionName ?? "")}
          session={session}
        />
      ))}
    </div>
  )
})

const TabbarActions = () => {
  const groupTabsByTool = useSelector(() => sessionStore.groupTabsByTool)
  const hideTabbarActions = useSelector(() => activeAppletStore.getActiveApplet().appletId === "")

  const onClickAddTab = () => {
    sessionStore.createSessionOfActiveApplet()
  }

  const handleClickGroupTabs = () => {
    sessionStore.toggleGroupTabsByTool()
  }

  if (hideTabbarActions) {
    return null
  }

  return (
    <>
      <SessionTabbarItemIcon
        onClick={handleClickGroupTabs}
        label="Group Tabs By Tool"
        icon={groupTabsByTool ? Icons.FilterSolid : Icons.Filter}
      />
      <SessionTabbarItemIcon
        onClick={onClickAddTab}
        label="Add Tab"
        icon={Icons.Plus}
      />
    </>
  )
}

interface SessionTabbarItemIconProps {
  onClick: () => any
  label: string
  icon: string
  style?: CSSProperties
}

const SessionTabbarItemIcon: FC<SessionTabbarItemIconProps> = memo((props) => {
  const { onClick, label, icon, style } = props

  return (
    <Tooltip overlay={label}>
      <div onClick={onClick} className="SessionTabbar-item-session icon" style={style}>
        <div className="SessionTabbar-item-session-icon">
          <img src={icon} alt={label} />
        </div>
      </div>
    </Tooltip>
  )
}, (prevProps, nextProps) => {
  return prevProps.icon === nextProps.icon
})
