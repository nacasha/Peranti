import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { activeSessionStore } from "src/stores/activeSessionStore"

export const ToolBatchModeButton: FC = observer(() => {
  const activeTool = activeSessionStore.getActiveTool()

  const onClickButton = () => {
    activeSessionStore.toggleBatchMode()
  }

  if (!activeSessionStore.toolHasBatchOutput || activeTool.isDeleted) {
    return null
  }

  return (
    <Button icon={Icons.Layers2} onClick={onClickButton}>
      Batch
    </Button>
  )
})
