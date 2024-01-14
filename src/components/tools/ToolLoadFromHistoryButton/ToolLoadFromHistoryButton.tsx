import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { assets } from "src/constants/assets"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolSessionStore } from "src/stores/toolSessionStore"

export const ToolLoadFromHistoryButton: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()

  const onClick = () => {
    toolSessionStore.createSessionFromHistory(activeTool.toHistory())
  }

  if (!activeTool.isReadOnly) {
    return null
  }

  return (
    <Button icon={assets.DownloadSVG} onClick={onClick}>
      Open In Editor
    </Button>
  )
})
