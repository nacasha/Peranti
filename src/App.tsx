import { lazy } from "react"

import { useSelector } from "./hooks/useSelector.ts"
import { withProviders } from "./providers/index.ts"
import { userSettingsStore } from "./stores/userSettingsStore.ts"

/**
 * Lazy load the Main App, this is done to hold initialize stores until
 * the user settings completely loaded from file
 *
 * Because once we import the store files, the class will be initialized
 * into the variable
 */
const AppMain = lazy(async() => await import("./AppMain.tsx"))

export const DefferedApp = () => {
  const isLoaded = useSelector(() => userSettingsStore.isLoaded)
  return isLoaded ? <AppMain /> : null
}

export const App = withProviders(DefferedApp)
