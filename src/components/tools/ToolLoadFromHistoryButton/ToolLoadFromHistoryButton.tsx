import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { icons } from "src/constants/icons"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolSessionStore } from "src/stores/toolSessionStore"

export const ToolLoadFromHistoryButton: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()

  const onClick = () => {
    /**
     * Transform active tool to history
     */
    toolSessionStore.createSessionFromHistory(activeTool.toHistory())
  }

  if (!activeTool.isReadOnly) {
    return null
  }

  return (
    <Button icon={icons.Download} onClick={onClick}>
      Open In Editor
    </Button>
  )
})
