import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

export const ToolBatchModeButton: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()

  const onClickButton = () => {
    toolRunnerStore.toggleBatchMode()
  }

  if (!toolRunnerStore.toolHasBatchOutput || activeTool.isDeleted) {
    return null
  }

  return (
    <Button icon={Icons.Layers2} onClick={onClickButton}>
      Batch
    </Button>
  )
})
