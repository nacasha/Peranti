import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { activeSessionStore } from "src/stores/activeSessionStore"
import { sessionHistoryStore } from "src/stores/sessionHistoryStore"

export const ToolLoadFromHistoryButton: FC = () => {
  const sessionId = useSelector(() => activeSessionStore.getActiveTool().sessionId)
  const isHistory = useSelector(() => activeSessionStore.getActiveTool().isDeleted)

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
