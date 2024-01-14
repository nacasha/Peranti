import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { assets } from "src/constants/assets.tsx"
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
    <Button icon={assets.Layers2SVG} onClick={onClickButton}>
      Batch
    </Button>
  )
})
