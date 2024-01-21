import { useSelector } from "src/hooks/useSelector"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

import "./AppStatusbar.scss"

export const AppStatusbar = () => {
  const activeToolSessionId = useSelector(() => toolRunnerStore.getActiveTool().sessionId)

  return (
    <div className="AppStatusbar">
      {activeToolSessionId}
    </div>
  )
}
