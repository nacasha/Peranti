import { lazy } from "react"

/**
 * Bootstrap libraries and initial routines
 */
import "src/bootstrap/bootstrap.ts"

import { useSelector } from "./hooks/useSelector.ts"
import { userSettingsService } from "./services/user-settings-service.ts"

/**
 * Lazy load main application entry after user settings has been
 * successfully loaded, and only hand it over once the persisted interface
 * state is restored, so the default layout never flashes on startup
 */
const AppMain = lazy(async() => {
  const { registerBuiltInComponents } = await import("./components/registry/index.ts")
  registerBuiltInComponents()

  const appMain = await import("./AppMain.tsx")
  const { waitForRestoredState } = await import("./bootstrap/wait-for-restored-state.ts")
  await waitForRestoredState()
  return appMain
})

export const DefferedApp = () => {
  const isLoaded = useSelector(() => userSettingsService.isLoaded)
  return isLoaded ? <AppMain /> : null
}

export const App = DefferedApp
