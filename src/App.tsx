import { useEffect } from "react"
import { AppSidebar } from "src/components/AppSidebar"
import { AppTitlebar } from "src/components/AppTitlebar"
import { ToolView } from "src/components/ToolView"

export const App = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "p") {
        event.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <div className="AppRoot">
      <AppTitlebar />

      <div className="AppContainer">
        <AppSidebar />
        <div className="AppContent">
          <ToolView />
        </div>
      </div>
    </div>
  )
}
