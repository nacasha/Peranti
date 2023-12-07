import { AppSidebar } from "src/components/AppSidebar"
import { AppStatusbar } from "src/components/AppStatusbar"
import { AppTitlebar } from "src/components/AppTitlebar"
import { ToolHeader } from "src/components/ToolHeader"
import { ToolArea } from "src/components/ToolArea"

export const App = () => {
  return (
    <div className="AppRoot">
      <AppTitlebar />

      <div className="AppContainer">
        <AppSidebar />
        <div className="AppContent">
          <ToolHeader />
          <ToolArea />
        </div>
      </div>

      <AppStatusbar />
    </div>
  )
}
