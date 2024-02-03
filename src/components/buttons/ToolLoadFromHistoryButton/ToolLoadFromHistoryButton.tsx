import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { toolHistoryStore } from "src/stores/toolHistoryStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

export const ToolLoadFromHistoryButton: FC = () => {
  const sessionId = useSelector(() => toolRunnerStore.getActiveTool().sessionId)
  const isHistory = useSelector(() => toolRunnerStore.getActiveTool().isDeleted)

  const handleRestoreHistory = () => {
    if (isHistory) {
      void toolHistoryStore.restoreHistory(sessionId)
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
