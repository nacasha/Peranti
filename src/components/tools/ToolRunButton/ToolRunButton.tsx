import { observer } from "mobx-react"

import { Button } from "src/components/common/Button"
import { assets } from "src/constants/assets"
import { toolStore } from "src/stores/toolStore"

import "./ToolRunButton.scss"

export const ToolRunButton = observer(() => {
  const activeTool = toolStore.getActiveTool()

  const onClickRun = () => {
    toolStore.runActiveTool()
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
