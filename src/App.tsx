import { AppSidebar } from "./components/app/AppSidebar"
import { AppSidebarContent } from "./components/app/AppSidebarContent"
import { AppStatusbar } from "./components/app/AppStatusbar"
import { AppTitlebar } from "./components/app/AppTitlebar"
import { AppWindowSizeListener } from "./components/app/AppWindowSizeListener"
import { AppWindowSizeObserver } from "./components/app/AppWindowSizeObserver"
import { ToolPage } from "./pages/ToolPage"

export const App = () => {
  return (
    <div className="AppRoot">
      <AppWindowSizeListener />
      <AppWindowSizeObserver />
      <AppTitlebar />

      <div className="AppContainer">
        <AppSidebar />

        <div className="AppContent">
          <AppSidebarContent />
          <ToolPage />
        </div>
      </div>
      <AppStatusbar />
    </div>
  )
}
