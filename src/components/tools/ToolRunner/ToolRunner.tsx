import { observer } from "mobx-react"
import { useEffect, type FC } from "react"

import { toolStore } from "src/stores/toolStore"

export const ToolRunner: FC = observer(() => {
  const activeTool = toolStore.getActiveTool()

  useEffect(() => {
    if (activeTool.autoRun) {
      toolStore.runActiveTool()
    }
  }, [activeTool.inputParams])

  return null
})
