import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { sessionHistoryStore } from "src/services/session-history-store"

export const RestoreClosedEditorButton: FC = () => {
  const sessionId = useSelector(() => activeAppletStore.getActiveApplet().sessionId)
  const isHistory = useSelector(() => activeAppletStore.getActiveApplet().isDeleted)

  const handleRestoreHistory = () => {
    if (isHistory) {
      void sessionHistoryStore.restoreHistory(sessionId)
    }
  }

  if (!isHistory) {
    return null
  }

  return (
    <Button icon={Icons.Untrash} onClick={handleRestoreHistory}>
      Restore
    </Button>
  )
}
