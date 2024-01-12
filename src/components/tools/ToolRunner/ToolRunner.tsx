import { observer } from "mobx-react"
import { useEffect, type FC } from "react"

import { toolStore } from "src/stores/toolStore"

export const ToolRunner: FC = observer(() => {
  const activeTool = toolStore.getActiveTool()

  useEffect(() => {
    if (activeTool.autoRun) {
      const { isInputValuesModified, runCount, runOnFirstTimeOpen } = activeTool
      const allowToRunFirstTime = runCount === 0 && runOnFirstTimeOpen

      if (allowToRunFirstTime || isInputValuesModified) {
        toolStore.runActiveTool()
      }
    }
  }, [activeTool.inputValues])

  return null
})
