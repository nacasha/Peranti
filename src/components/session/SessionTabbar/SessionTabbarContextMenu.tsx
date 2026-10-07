import { type FC } from "react"
import { type ItemParams, Separator } from "react-contexify"

import { ContextMenu, ContextMenuItem } from "src/components/common/ContextMenu"
import { Icons } from "src/constants/icons"
import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { sessionStore } from "src/services/session-store"
import { type Session } from "src/types/Session"

interface MenuParams {
  session: Session
}

type TabbarContextMenuItemParams = ItemParams<MenuParams>

export const SessionTabbarContextMenu: FC = () => {
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
      sessionStore.setRenamingSessionId(session.sessionId)
    }
  }

  return (
    <ContextMenu id={ContextMenuKeys.SessionTabbar}>
      <ContextMenuItem
        id="close"
        icon={Icons.Close}
        onClick={handleCloseSession}
      >
        Close
      </ContextMenuItem>
      <ContextMenuItem
        id="close-others"
        icon={Icons.CloseOthers}
        onClick={handleCloseOtherSession}
      >
        Close Others
      </ContextMenuItem>
      <ContextMenuItem
        id="close-all"
        icon={Icons.CloseAll}
        danger
        onClick={handleCloseAllSession}
      >
        Close All
      </ContextMenuItem>
      <Separator />
      <ContextMenuItem
        id="rename"
        icon={Icons.Rename}
        onClick={handleRenameSession}
      >
        Rename
      </ContextMenuItem>
    </ContextMenu>
  )
}
