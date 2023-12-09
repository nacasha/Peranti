import { AppSidebar } from "src/components/AppSidebar"
import { AppTitlebar } from "src/components/AppTitlebar"
import { ToolView } from "src/components/ToolView"

export const App = () => {
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
