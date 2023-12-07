import { AppSidebar } from "src/components/AppSidebar"
import { AppStatusbar } from "src/components/AppStatusbar"
import { AppTitlebar } from "src/components/AppTitlebar"
import { ToolHeader } from "src/components/ToolHeader"
import { ToolRunArea } from "src/components/ToolRunArea"

export const App = () => {
  return (
    <div className="AppRoot">
      <AppTitlebar />

      <div className="AppContainer">
        <AppSidebar />
        <div className="AppContent">
          <ToolHeader />
          <ToolRunArea />
        </div>
      </div>

      <AppStatusbar />
    </div>
  )
}
