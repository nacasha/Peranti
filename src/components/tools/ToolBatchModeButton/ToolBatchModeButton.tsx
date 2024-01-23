import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { icons } from "src/constants/icons"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

export const ToolBatchModeButton: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()

  const onClickButton = () => {
    toolRunnerStore.toggleBatchMode()
  }

  if (!toolRunnerStore.toolHasBatchOutput || activeTool.isReadOnly) {
    return null
  }

  return (
    <Button icon={icons.Layers2} onClick={onClickButton}>
      Batch
    </Button>
  )
})
