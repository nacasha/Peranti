import { Route } from "wouter"

import { useSelector } from "src/hooks/useSelector"
import { HomePage } from "src/pages/HomePage"
import { SettingsPage } from "src/pages/SettingsPage"
import { ToolPage } from "src/pages/ToolPage"
import { toolSessionStore } from "src/stores/toolSessionStore"

export const AppRoute = () => {
  const isSessionInitialized = useSelector(() => toolSessionStore.isInitialized)

  if (!isSessionInitialized) {
    return null
  }

  return (
    <>
      <Route path="/welcome">
        <HomePage />
      </Route>
      <Route path="/">
        <ToolPage />
      </Route>
      <Route path="/settings">
        <SettingsPage />
      </Route>
    </>
  )
}
