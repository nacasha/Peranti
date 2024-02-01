import { observer } from "mobx-react"
import { useEffect, type FC, useRef } from "react"

import { type Tool } from "src/models/Tool"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

export const ToolRunner: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()
  const previousTool = useRef<Tool | null>(null)

  useEffect(() => {
    if (activeTool.autoRun) {
      const isToolChanged = previousTool.current?.sessionId !== activeTool.sessionId
      const { isInputValuesModified, runCount } = activeTool

      /**
       * New created session that hasn't been run at least once
       */
      if (isToolChanged && runCount === 0) {
        toolRunnerStore.runActiveTool()

      /**
       * Tool remains opened and has input values modified
       */
      } else if (!isToolChanged && isInputValuesModified) {
        toolRunnerStore.runActiveTool()
      }
    }
  }, [activeTool.inputValues])

  useEffect(() => {
    /**
     * Keep track of last active tool
     */
    if (activeTool.sessionId !== previousTool.current?.sessionId) {
      previousTool.current = activeTool
    }
  }, [activeTool.sessionId])

  return null
})
