import { lazy } from "react"

import "src/bootstrap/bootstrap.ts"

import { useSelector } from "./hooks/useSelector.ts"
import { userSettingsService } from "./services/user-settings-service.ts"

const AppMain = lazy(async() => await import("./AppMain.tsx"))

export const DefferedApp = () => {
  const isLoaded = useSelector(() => userSettingsService.isLoaded)
  return isLoaded ? <AppMain /> : null
}

export const App = DefferedApp
