import { clsx } from "clsx"
import { type ReactNode } from "react"

import { interfaceStore } from "src/stores/interfaceStore.ts"

import { withProviders } from "./app/providers/index.js"
import { AppSidebar } from "./components/app/AppSidebar"
import { AppSidebarContent } from "./components/app/AppSidebarContent"
import { AppStatusbar } from "./components/app/AppStatusbar"
import { AppTitlebar } from "./components/app/AppTitlebar"
import { AppWindowSizeListener } from "./components/app/AppWindowSizeListener"
import { AppWindowSizeObserver } from "./components/app/AppWindowSizeObserver"
import { useSelector } from "./hooks/useSelector.js"
import { ToolPage } from "./pages/ToolPage"

/**
 * AppRoot
 *
 * @param param0 ReactNode
 * @returns
 */
const AppRoot = ({ children }: { children: ReactNode }) => {
  const theme = useSelector(() => interfaceStore.theme)

  return (
    <div className={clsx("AppRoot", theme)}>
      {children}
    </div>
  )
}

/**
 * App
 *
 * @returns ReactNode
 */
const AppMain = () => {
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

export const App = withProviders(AppMain)
