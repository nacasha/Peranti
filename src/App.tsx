import { AppSidebar } from "src/components/AppSidebar"
import { AppTitlebar } from "src/components/AppTitlebar"
import { ToolView } from "src/components/ToolView"
import { AppStatusbar } from "./components/AppStatusbar"
import { AppWindowSizeListener } from "./components/AppWindowSizeListener"
import { AppWindowSizeObserver } from "./components/AppWindowSizeObserver"
import { AppSidebarContent } from "./components/AppSidebarContent"

export const App = () => {
  return (
    <div className="AppRoot">
      <AppWindowSizeListener />
      <AppWindowSizeObserver />
      <AppTitlebar />

      <div className="AppContainer">
        <AppSidebar />
        <AppSidebarContent />
        <div className="AppContent">
          <ToolView />
        </div>
      </div>
      <AppStatusbar />
    </div>
  )
}
