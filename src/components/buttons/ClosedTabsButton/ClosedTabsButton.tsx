import { observer } from "mobx-react"
import { useId, useState } from "react"
import { Item, type ItemParams, Separator, useContextMenu } from "react-contexify"
import { createPortal } from "react-dom"
import SimpleBar from "simplebar-react"

import historyApplet from "src/applets/pages/history-applet"
import { ButtonIcon } from "src/components/common/ButtonIcon"
import { ContextMenu, ContextMenuItem } from "src/components/common/ContextMenu"
import { Icons } from "src/constants/icons"
import { Links } from "src/constants/links"
import { appletStore } from "src/services/applet-store"
import { sessionHistoryStore } from "src/services/session-history-store"
import { sessionStore } from "src/services/session-store"
import { type SessionHistory } from "src/types/SessionHistory"
import { formatTimeAgo } from "src/utils/format-time-ago"
import { openLink } from "src/utils/open-link"

import "./ClosedTabsButton.scss"

/**
 * Fixed so the menu can be right-aligned before it renders
 */
const MENU_WIDTH = 280

/**
 * Titlebar button listing recently closed tabs; picking one reopens it
 */
export const ClosedTabsButton = observer(() => {
  const menuId = useId()
  const { show, hideAll } = useContextMenu({ id: menuId })
  const [now, setNow] = useState(() => Date.now())
  const [isVisible, setIsVisible] = useState(false)

  const { recent: histories, featureEnabled: isFeatureEnabled, isSupported } = sessionHistoryStore
  const featureEnabled = isSupported && isFeatureEnabled

  const handleClickButton = (event: React.MouseEvent<HTMLDivElement>) => {
    // The button's click lands before the menu's own outside-click handler,
    // so the menu is still open here and a second click toggles it closed
    if (isVisible) {
      hideAll()
      return
    }

    setNow(Date.now())

    // Right-align the menu with the button. Left to itself the menu only
    // clamps to the window, which pins it flush against the right edge
    const { right, bottom } = event.currentTarget.getBoundingClientRect()
    show({ event, position: { x: right - MENU_WIDTH, y: bottom + 4 } })
  }

  const handleRestore = (params: ItemParams<any, SessionHistory>) => {
    if (params.data) {
      void sessionHistoryStore.restoreHistory(params.data)
    }
  }

  const handleManageHistory = () => {
    sessionStore.findOrCreateSession(historyApplet)
  }

  const handleEnableHistory = () => {
    sessionHistoryStore.setFeatureEnabled(true)
  }

  const handleGetDesktopApp = () => {
    void openLink(Links.DesktopReleases)
  }

  const handleClearHistory = () => {
    sessionHistoryStore.clearAllHistoryWithConfirm()
  }

  return (
    <>
      <ButtonIcon
        tooltip="Recently Closed Tabs"
        icon={Icons.History}
        onClick={handleClickButton}
      />

      {createPortal(
        <ContextMenu
          id={menuId}
          className="ClosedTabsMenu"
          style={{ width: MENU_WIDTH }}
          onVisibilityChange={setIsVisible}
        >
          <Item disabled className="ClosedTabsMenu-group">Recently Closed</Item>

          {!isSupported && (
            <>
              <div className="ClosedTabsMenu-placeholder">
                <div className="ClosedTabsMenu-placeholder-title">Available in the desktop app</div>
                <div>Use the desktop version to keep and reopen closed tabs</div>
              </div>
              <Separator />
              <ContextMenuItem
                icon={Icons.Download}
                onClick={handleGetDesktopApp}
              >
                Get the Desktop App
              </ContextMenuItem>
            </>
          )}

          {isSupported && !isFeatureEnabled && (
            <>
              <div className="ClosedTabsMenu-placeholder">
                <div className="ClosedTabsMenu-placeholder-title">History is disabled</div>
                <div>Closed tabs aren&apos;t being kept</div>
              </div>
              <Separator />
              <ContextMenuItem
                icon={Icons.History}
                onClick={handleEnableHistory}
              >
                Enable History
              </ContextMenuItem>
            </>
          )}

          {featureEnabled && histories.length === 0 && (
            <div className="ClosedTabsMenu-placeholder centered">
              <div className="ClosedTabsMenu-placeholder-title">No closed tabs</div>
            </div>
          )}

          {featureEnabled && (
            <SimpleBar className="ClosedTabsMenu-list">
              {histories.map((history) => {
                const toolName = appletStore.mapOfLoadedAppletsName[history.appletId] ?? history.appletId

                return (
                  <Item
                    key={history.sessionId}
                    data={history}
                    onClick={handleRestore}
                  >
                    <span className="ClosedTabsMenu-label">
                      <span className="ClosedTabsMenu-tool">{toolName}</span>
                      {history.sessionName && (
                        <span className="ClosedTabsMenu-name">{history.sessionName}</span>
                      )}
                    </span>
                    <span className="ClosedTabsMenu-time">
                      {formatTimeAgo(history.deletedAt, now)}
                    </span>
                  </Item>
                )
              })}
            </SimpleBar>
          )}

          {featureEnabled && (
            <>
              <Separator />
              <ContextMenuItem
                icon={Icons.History}
                onClick={handleManageHistory}
              >
                Manage History
              </ContextMenuItem>
              {histories.length > 0 && (
                <ContextMenuItem
                  icon={Icons.Clean}
                  danger
                  onClick={handleClearHistory}
                >
                  Clear History
                </ContextMenuItem>
              )}
            </>
          )}
        </ContextMenu>,
        document.body
      )}
    </>
  )
})
