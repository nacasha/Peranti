import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { toolHistoryStore } from "src/stores/toolHistoryStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

export const ToolLoadFromHistoryButton: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()

  const handleRestoreHistory = () => {
    if (activeTool.isHistory) {
      toolHistoryStore.restoreHistory(activeTool.sessionId)
    }
  }

  if (!activeTool.isHistory) {
    return null
  }

  return (
    <Button icon={Icons.Download} onClick={handleRestoreHistory}>
      Restore This Editor
    </Button>
  )
})
