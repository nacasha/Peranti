import { observer } from "mobx-react"
import { useEffect, type FC, useRef } from "react"

import { type Tool } from "src/models/Tool"
import { activeSessionStore } from "src/stores/activeSessionStore"

export const ActiveSessionStateListener: FC = observer(() => {
  const activeTool = activeSessionStore.getActiveTool()
  const previousTool = useRef<Tool | null>(null)

  useEffect(() => {
    if (activeTool.autoRun) {
      const isToolChanged = previousTool.current?.sessionId !== activeTool.sessionId
      const { isInputValuesModified, isAutoRunAndFirstTime: toolIsAutoRunAndFirstTime } = activeTool

      if (isToolChanged && toolIsAutoRunAndFirstTime) {
        activeSessionStore.runActiveTool()
      } else if (!isToolChanged && isInputValuesModified) {
        activeSessionStore.runActiveTool()
      }
    }
  }, [activeTool.inputValues])

  useEffect(() => {
    if (activeTool.sessionId !== previousTool.current?.sessionId) {
      previousTool.current = activeTool
    }
  }, [activeTool.sessionId])

  return null
})
