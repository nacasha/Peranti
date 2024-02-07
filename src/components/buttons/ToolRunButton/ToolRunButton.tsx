import { observer } from "mobx-react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { activeSessionStore } from "src/stores/activeSessionStore"

import "./ToolRunButton.scss"

export const ToolRunButton = observer(() => {
  const activeTool = activeSessionStore.getActiveTool()

  const onClickRun = () => {
    activeSessionStore.runActiveTool()
  }

  if (activeTool.isDeleted) {
    return null
  }

  return (
    <Button icon={Icons.RunFilled} onClick={onClickRun}>
      Run Tool
    </Button>
  )
})
