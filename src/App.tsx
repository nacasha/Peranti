import { AppSidebar } from "src/components/AppSidebar"
import { AppTitlebar } from "src/components/AppTitlebar"
import { ToolView } from "src/components/ToolView"
import { AppStatusbar } from "./components/AppStatusbar"

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
      <AppStatusbar />
    </div>
  )
}
