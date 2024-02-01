import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { toolHistoryStore } from "src/stores/toolHistoryStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

export const ToolDeleteButton: FC = () => {
  const sessionId = useSelector(() => toolRunnerStore.getActiveTool().sessionId)
  const isDeleted = useSelector(() => toolRunnerStore.getActiveTool().isDeleted)

  const onClickClean = () => {
    toolHistoryStore.deleteHistory(sessionId)
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
