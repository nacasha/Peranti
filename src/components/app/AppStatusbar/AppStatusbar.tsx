import { observer } from "mobx-react"

import { toolStore } from "src/stores/toolStore"

import "./AppStatusbar.scss"

export const AppStatusbar = observer(() => {
  const activeTool = toolStore.getActiveTool()

  return (
    <div className="AppStatusbar">
      {activeTool.instanceId}
    </div>
  )
})
