import { appWindow } from "@tauri-apps/api/window"
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

import { sessionTabbarClasses } from "./SessionTabbar.css"
import { SessionTabbarContextMenu } from "./SessionTabbarContextMenu.tsx"
import { SessionTabbarItem } from "./SessionTabbarItem.tsx"

export const SessionTabbar: FC = () => {
  const sessions = useSelector(() => sessionStore.getRunningSessionOfActiveApplet())
  const appTitlebarStyle = useSelector(() => interfaceStore.appTitlebarStyle)

  const scrollBarRef = useRef<HTMLDivElement>(null)

  useHotkeysModified(hotkeysStore.keys.TAB_NEW_EDITOR, (event) => {
    event.preventDefault()
    sessionStore.createSessionOfActiveApplet()
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_NEXT, (event) => {
    event.preventDefault()
    sessionStore.cycleOpenNextSessionOfActiveSession()
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CYCLE_PREV, (event) => {
    event.preventDefault()
    sessionStore.cycleOpenPreviousSessionOfActiveSession()
  })

  useHotkeysModified(hotkeysStore.keys.TAB_CLOSE, (event) => {
    event.preventDefault()
    void sessionStore.closeSessionOfActiveApplet()
  })

  useHotkeysModified(hotkeysStore.keys.RESTORE_CLOSED_TAB, (event) => {
    event?.preventDefault()
    void sessionHistoryStore.restoreLastHistory()
  })

  useHotkeysModified(hotkeysStore.keys.RENAME_ACTIVE_TAB, (event) => {
    event?.preventDefault()
    sessionStore.setRenamingSessionIdOfActiveApplet()
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
    <div className={sessionTabbarClasses.root}>
      {/* Below component was outside the root */}
      <div className={sessionTabbarClasses.windowExtraDrag} data-tauri-drag-region></div>
      <div className={sessionTabbarClasses.rootBorderBottom} data-tauri-drag-region />

      <div className={sessionTabbarClasses.inner}>
        <TabbarActions />

        <div className={sessionTabbarClasses.innerBody} data-tauri-drag-region>
          <div className={sessionTabbarClasses.innerSimplebar}>
            <SimpleBar
              style={{ width: "100%" }}
              scrollableNodeProps={{ ref: scrollBarRef }}
            >
              {sessions.map((session) => (
                <SessionTabbarItem
                  key={session.sessionId.concat(session.sessionName ?? "")}
                  session={session}
                />
              ))}
              <div className={sessionTabbarClasses.innerSimplebarBorderRight}></div>
            </SimpleBar>
          </div>
        </div>
      </div>

      {appTitlebarStyle === AppTitleBarStyle.Tabbar && <WindowControls />}
      <SessionTabbarContextMenu />
    </div>
  )
}

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
      <div onClick={onClick} className={sessionTabbarClasses.itemIcon} style={style}>
        <div className={sessionTabbarClasses.itemSessionIcon}>
          <img src={icon} alt={label} />
        </div>
      </div>
    </Tooltip>
  )
}, (prevProps, nextProps) => {
  return prevProps.icon === nextProps.icon
})
