import { clsx } from "clsx"
import { observer } from "mobx-react"

import { interfaceStore } from "src/stores/interfaceStore.ts"

import { AppSidebar } from "./components/app/AppSidebar"
import { AppSidebarContent } from "./components/app/AppSidebarContent"
import { AppStatusbar } from "./components/app/AppStatusbar"
import { AppTitlebar } from "./components/app/AppTitlebar"
import { AppWindowSizeListener } from "./components/app/AppWindowSizeListener"
import { AppWindowSizeObserver } from "./components/app/AppWindowSizeObserver"
import { ToolPage } from "./pages/ToolPage"

export const App = observer(() => {
  const { theme } = interfaceStore

  return (
    <div className={clsx("AppRoot", theme)}>
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
})
