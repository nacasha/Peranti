import clsx from "clsx"
import { type FC, type ReactNode } from "react"

import { ActivityBar } from "./components/activity-bar/ActivityBar/index.ts"
import { AppRouteListener } from "./components/app/AppRoute/index.ts"
import { AppStatusbar } from "./components/app/AppStatusbar/index.ts"
import { AppThemeListener } from "./components/app/AppThemeListener/AppThemeListener.tsx"
import { AppTitlebar } from "./components/app/AppTitlebar/index.ts"
import { FileDropArea } from "./components/filedrop/FileDropArea/index.ts"
import { FileDropListener } from "./components/filedrop/FileDropListener"
import { PrimarySidebar } from "./components/sidebar/PrimarySidebar/index.ts"
import { ToolTabbar } from "./components/tools/ToolTabbar/ToolTabbar.tsx"
import { WindowResizeEventListener } from "./components/window/WindowResizeEventListener/index.ts"
import { WindowSizeListener } from "./components/window/WindowSizeListener/index.ts"
import { useSelector } from "./hooks/useSelector.ts"
import { ToolPage } from "./pages/ToolPage/ToolPage.tsx"
import { interfaceStore } from "./stores/interfaceStore.ts"

const AppRoot: FC<{ children: ReactNode }> = ({ children }) => {
  const titlebarStyle = useSelector(() => interfaceStore.appTitlebarStyle)
  const isWindowMaximized = useSelector(() => interfaceStore.isWindowMaximized)

  const windowState = {
    WindowMaximized: isWindowMaximized
  }

  return (
    <div className={clsx("AppRoot", titlebarStyle, windowState)}>
      {children}
    </div>
  )
}

/**
 * App
 *
 * @returns ReactNode
 */
export const AppMain = () => {
  return (
    <AppRoot>
      <AppRouteListener />
      <AppThemeListener />

      <WindowResizeEventListener />
      <WindowSizeListener />

      <FileDropArea />
      <FileDropListener />

      <AppTitlebar />
      <div className="AppContainer">
        <ActivityBar />
        <PrimarySidebar />

        <div className="AppContent">
          <ToolTabbar />
          <div style={{ display: "flex", flex: 1, flexDirection: "row", overflow: "hidden" }}>
            <ToolPage />
          </div>
        </div>
      </div>

      <AppStatusbar />
    </AppRoot>
  )
}

export default AppMain
