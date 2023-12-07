import { observer } from "mobx-react"
import { useEffect } from "react"
import { toolStore } from "src/store/toolStore"

export const ToolRunButton = observer(() => {
  const activeTool = toolStore.getActiveTool()

  const onClickRun = () => {
    activeTool.run()
  }

  useEffect(() => {
    activeTool.run()
  }, [activeTool.inputParams])

  return (
    <div className="toolbar-button">
      <button onClick={onClickRun}>Run</button>
    </div>
  )
})
