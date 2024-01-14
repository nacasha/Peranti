import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { assets } from "src/constants/assets"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

export const ToolLoadFromHistoryButton: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()

  const onClick = () => {
    toolRunnerStore.makeCurrentToolHistoryEditable()
  }

  if (!activeTool.isReadOnly) {
    return null
  }

  return (
    <Button icon={assets.DownloadSVG} onClick={onClick}>
      Edit This History
    </Button>
  )
})
