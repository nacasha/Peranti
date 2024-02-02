import { AppSidebar } from "src/components/app/AppSidebar"
import { AppSidebarContent } from "src/components/app/AppSidebarContent"
import { AppStatusbar } from "src/components/app/AppStatusbar"
import { AppTitlebar } from "src/components/app/AppTitlebar"
import { AppWindowSizeListener } from "src/components/app/AppWindowSizeListener"
import { AppWindowSizeObserver } from "src/components/app/AppWindowSizeObserver"

import { AppRoot } from "./AppRoot.tsx"
import { AppRoute } from "./AppRoute.tsx"
import { AppRouteListener } from "./AppRouteListener.tsx"

/**
 * App
 *
 * @returns ReactNode
 */
export const AppMain = () => {
  return (
    <AppRoot>
      <AppRouteListener />
      <AppWindowSizeListener />
      <AppWindowSizeObserver />
      <AppTitlebar />

      <div className="AppContainer">
        <AppSidebar />

        <div className="AppContent">
          <AppSidebarContent />
          <AppRoute />
        </div>
      </div>

      <AppStatusbar />
    </AppRoot>
  )
}
