import { useEffect, type FC } from "react"
import { toolStore } from "src/store/toolStore"

export const ToolRunnerManual: FC = () => {
  /**
   * Shortcut ALT ENTER handler
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "Enter") {
        event.preventDefault()
        toolStore.runActiveTool()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return null
}
