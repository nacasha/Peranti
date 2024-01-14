import { observer } from "mobx-react"

import { Button } from "src/components/common/Button"
import { assets } from "src/constants/assets"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

import "./ToolRunButton.scss"

export const ToolRunButton = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()

  const onClickRun = () => {
    toolRunnerStore.runActiveTool()
  }

  if (activeTool.isReadOnly) {
    return null
  }

  return (
    <Button icon={assets.RunFilledSVG} onClick={onClickRun}>
      Run Tool
    </Button>
  )
})
