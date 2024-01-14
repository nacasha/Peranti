import { observer } from "mobx-react"

import { toolRunnerStore } from "src/stores/toolRunnerStore"

import "./AppStatusbar.scss"

export const AppStatusbar = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()

  return (
    <div className="AppStatusbar">
      {activeTool.sessionId}
    </div>
  )
})
