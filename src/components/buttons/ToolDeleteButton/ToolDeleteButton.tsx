import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { activeSessionStore } from "src/stores/activeSessionStore"
import { sessionHistoryStore } from "src/stores/sessionHistoryStore"

export const ToolDeleteButton: FC = () => {
  const sessionId = useSelector(() => activeSessionStore.getActiveTool().sessionId)
  const isDeleted = useSelector(() => activeSessionStore.getActiveTool().isDeleted)

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
