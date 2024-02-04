import clsx from "clsx"

import { ActivityBar } from "./components/activity-bar/ActivityBar"
import { AppRoute, AppRouteListener } from "./components/app/AppRoute"
import { AppStatusbar } from "./components/app/AppStatusbar"
import { AppTitlebar } from "./components/app/AppTitlebar"
import { FileDropArea } from "./components/filedrop/FileDropArea"
import { PrimarySidebar } from "./components/sidebar/PrimarySidebar"
import { WindowResizeEventListener } from "./components/window/WindowResizeEventListener"
import { WindowSizeListener } from "./components/window/WindowSizeListener"
import { useSelector } from "./hooks/useSelector.ts"
import { withProviders } from "./providers/index.ts"
import { interfaceStore } from "./stores/interfaceStore.ts"
import "./styles/root.scss"

/**
 * App
 *
 * @returns ReactNode
 */
export const AppMain = () => {
  const theme = useSelector(() => interfaceStore.theme)

  return (
    <div className={clsx("AppRoot", theme)}>
      <AppRouteListener />

      <WindowResizeEventListener />
      <WindowSizeListener />

      <FileDropArea />

      <AppTitlebar />
      <div className="AppContainer">
        <ActivityBar />
        <div className="AppContent">
          <PrimarySidebar />
          <AppRoute />
        </div>
      </div>

      <AppStatusbar />
    </div>
  )
}

export const App = withProviders(AppMain)
