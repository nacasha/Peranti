import { lazy } from "react"

/**
 * Bootstrap libraries and initial routines
 */
import "src/bootstrap/bootstrap.ts"

import { useSelector } from "./hooks/useSelector.ts"
import { userSettingsService } from "./services/user-settings-service.ts"

/**
 * Lazy load main application entry after user settings has been
 * successfully loaded
 */
const AppMain = lazy(async() => await import("./AppMain.tsx"))

export const DefferedApp = () => {
  const isLoaded = useSelector(() => userSettingsService.isLoaded)
  return isLoaded ? <AppMain /> : null
}

export const App = DefferedApp
