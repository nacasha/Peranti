import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { assets } from "src/constants/assets.tsx"
import { toolStore } from "src/stores/toolStore.ts"

export const ToolBatchModeButton: FC = observer(() => {
  const activeTool = toolStore.getActiveTool()

  const onClickButton = () => {
    toolStore.toggleBatchMode()
  }

  if (!toolStore.toolHasBatchOutput || activeTool.isReadOnly) {
    return null
  }

  return (
    <Button icon={assets.Layers2SVG} onClick={onClickButton}>
      Batch
    </Button>
  )
})
