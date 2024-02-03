import clsx from "clsx"

import { ActivityBar } from "src/components/activity-bar/ActivityBar"
import { AppRoute, AppRouteListener } from "src/components/app/AppRoute"
import { AppStatusbar } from "src/components/app/AppStatusbar"
import { AppTitlebar } from "src/components/app/AppTitlebar"
import { PrimarySidebar } from "src/components/sidebar/PrimarySidebar/PrimarySidebar.tsx"
import { WindowResizeEventListener } from "src/components/window/WindowResizeEventListener"
import { WindowSizeListener } from "src/components/window/WindowSizeListener"
import { useSelector } from "src/hooks/useSelector.ts"
import { withProviders } from "src/providers/index.ts"
import { interfaceStore } from "src/stores/interfaceStore.ts"
import "src/styles/root.scss"

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
