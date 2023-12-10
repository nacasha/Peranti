import { observer } from "mobx-react"
import { assets } from "src/constants/assets"
import { toolStore } from "src/store/toolStore"

export const ToolRunButton = observer(() => {
  const activeTool = toolStore.getActiveTool()
  const isRunModeAuto = toolStore.isRunModeAuto

  const onClickRun = () => {
    toolStore.runActiveTool()
  }

  if (activeTool.isReadOnly) {
    return null
  }

  return (
    <div className="toolbar-button" onClick={onClickRun}>
      <img src={assets.RunSVG} alt="Run" />
      {isRunModeAuto ? "Auto Run" : "Run"}
    </div>
  )
})
