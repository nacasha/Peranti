import { Route } from "wouter"

import { useSelector } from "src/hooks/useSelector"
import { HomePage } from "src/pages/HomePage"
import { ToolPage } from "src/pages/ToolPage"
import { sessionStore } from "src/stores/sessionStore"

export const AppRoute = () => {
  const isSessionInitialized = useSelector(() => sessionStore.isInitialized)

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
    </>
  )
}
