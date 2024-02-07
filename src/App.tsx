import { lazy } from "react"

import { useSelector } from "./hooks/useSelector.ts"
import { withProviders } from "./providers/index.ts"
import { userSettingsStore } from "./stores/userSettingsStore.ts"

const AppMain = lazy(async() => await import("./AppMain.tsx"))

export const DefferedApp = () => {
  const isLoaded = useSelector(() => userSettingsStore.isLoaded)
  return isLoaded ? <AppMain /> : null
}

export const App = withProviders(DefferedApp)
