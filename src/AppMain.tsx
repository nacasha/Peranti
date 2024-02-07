import clsx from "clsx"
import { type FC, type ReactNode } from "react"

import { ActivityBar } from "./components/activity-bar/ActivityBar/index.ts"
import { AppRoute, AppRouteListener } from "./components/app/AppRoute/index.ts"
import { AppStatusbar } from "./components/app/AppStatusbar/index.ts"
import { AppThemeListener } from "./components/app/AppThemeListener/AppThemeListener.tsx"
import { AppTitlebar } from "./components/app/AppTitlebar/index.ts"
import { FileDropArea } from "./components/filedrop/FileDropArea/index.ts"
import { FileDropListener } from "./components/filedrop/FileDropListener"
import { PrimarySidebar } from "./components/sidebar/PrimarySidebar/index.ts"
import { WindowResizeEventListener } from "./components/window/WindowResizeEventListener/index.ts"
import { WindowSizeListener } from "./components/window/WindowSizeListener/index.ts"
import { useSelector } from "./hooks/useSelector.ts"
import { interfaceStore } from "./stores/interfaceStore.ts"

const AppRoot: FC<{ children: ReactNode }> = ({ children }) => {
  const titlebarStyle = useSelector(() => interfaceStore.titlebarStyle)

  return (
    <div className={clsx("AppRoot", titlebarStyle)}>
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
        <div className="AppContent">
          <PrimarySidebar />
          <AppRoute />
        </div>
      </div>

      <AppStatusbar />
    </AppRoot>
  )
}

export default AppMain
