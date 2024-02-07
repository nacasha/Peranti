import { lazy } from "react"

import { useSelector } from "./hooks/useSelector.ts"
import { withProviders } from "./providers/index.ts"
import { userSettingsService } from "./services/user-settings-service.ts"

const AppMain = lazy(async() => await import("./AppMain.tsx"))

export const DefferedApp = () => {
  const isLoaded = useSelector(() => userSettingsService.isLoaded)
  return isLoaded ? <AppMain /> : null
}

export const App = withProviders(DefferedApp)
