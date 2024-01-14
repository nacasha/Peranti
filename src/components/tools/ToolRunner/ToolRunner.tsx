import { observer } from "mobx-react"
import { useEffect, type FC } from "react"

import { toolRunnerStore } from "src/stores/toolRunnerStore"

export const ToolRunner: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()

  useEffect(() => {
    if (activeTool.autoRun) {
      const { isInputValuesModified, runCount, runOnFirstTimeOpen } = activeTool
      const allowToRunFirstTime = runCount === 0 && runOnFirstTimeOpen

      if (allowToRunFirstTime || isInputValuesModified) {
        toolRunnerStore.runActiveTool()
      }
    }
  }, [activeTool.inputValues])

  return null
})
