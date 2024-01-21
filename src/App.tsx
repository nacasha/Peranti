import { clsx } from "clsx"
import { type ReactNode, useEffect } from "react"
import "simplebar-react/dist/simplebar.min.css"

import { interfaceStore } from "src/stores/interfaceStore.ts"

import { AppSidebar } from "./components/app/AppSidebar"
import { AppSidebarContent } from "./components/app/AppSidebarContent"
import { AppStatusbar } from "./components/app/AppStatusbar"
import { AppTitlebar } from "./components/app/AppTitlebar"
import { AppWindowSizeListener } from "./components/app/AppWindowSizeListener"
import { AppWindowSizeObserver } from "./components/app/AppWindowSizeObserver"
import { useSelector } from "./hooks/useSelector.js"
import { ToolPage } from "./pages/ToolPage"
import { toolStore } from "./stores/toolStore.js"

/**
 * App
 *
 * @returns ReactNode
 */
export const App = () => {
  return (
    <AppRoot>
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
    </AppRoot>
  )
}

/**
 * AppRoot
 *
 * @param param0 ReactNode
 * @returns
 */
const AppRoot = ({ children }: { children: ReactNode }) => {
  const theme = useSelector(() => interfaceStore.theme)

  useEffect(() => {
    toolStore.setupTools()
  }, [])

  return (
    <div className={clsx("AppRoot", theme)}>
      {children}
    </div>
  )
}
