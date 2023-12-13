import { reaction } from "mobx"
import { useEffect, type FC } from "react"

import { toolStore } from "src/stores/toolStore"

export const ToolRunnerAuto: FC = () => {
  /**
   * Run on input blur handler
   */
  useEffect(() => {
    const dispose = reaction(
      () => toolStore.getActiveTool().inputParams,
      () => {
        toolStore.runActiveTool()
      })

    return () => {
      dispose()
    }
  }, [])

  return null
}
