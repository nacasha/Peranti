import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { sessionHistoryStore } from "src/services/session-history-store"

export const DeleteClosedEditorButton: FC = () => {
  const sessionId = useSelector(() => activeAppletStore.getActiveApplet().sessionId)
  const isDeleted = useSelector(() => activeAppletStore.getActiveApplet().isDeleted)

  const onClickClean = () => {
    sessionHistoryStore.deleteHistory(sessionId)
  }

  if (!isDeleted) {
    return null
  }

  return (
    <Button icon={Icons.Trash} onClick={onClickClean}>
      Delete
    </Button>
  )
}
