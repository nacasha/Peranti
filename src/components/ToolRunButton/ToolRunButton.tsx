import { observer } from "mobx-react"
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
    <div className="ToolRunButton toolbar-button" onClick={onClickRun}>
      <img src={assets.RunFilledSVG} alt="Run" />
      Run Tool
    </div>
  )
})
