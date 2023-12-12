import { Route } from "wouter"

import { AppSidebar } from "src/components/AppSidebar"
import { AppTitlebar } from "src/components/AppTitlebar"
import { AppStatusbar } from "./components/AppStatusbar"
import { AppWindowSizeListener } from "./components/AppWindowSizeListener"
import { AppWindowSizeObserver } from "./components/AppWindowSizeObserver"
import { ToolPage } from "./pages/ToolPage"
import { SettingsPage } from "./pages/SettingsPage"

export const App = () => {
  return (
    <div className="AppRoot">
      <AppWindowSizeListener />
      <AppWindowSizeObserver />
      <AppTitlebar />

      <div className="AppContainer">
        <AppSidebar />

        <div className="AppContent">
          <Route path="/tools/:toolId*" component={ToolPage} />
          <Route path="/settings" component={SettingsPage} />
        </div>
      </div>
      <AppStatusbar />
    </div>
  )
}
