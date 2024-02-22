import { type FC } from "react"
import { type ItemParams, Item, Separator } from "react-contexify"

import { ContextMenu } from "src/components/common/ContextMenu"
import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { sessionStore } from "src/services/session-store"
import { type Session } from "src/types/Session"

import { $renamingSessionId } from "./SessionTabbar.tsx"

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
        Rename
      </Item>
    </ContextMenu>
  )
}
