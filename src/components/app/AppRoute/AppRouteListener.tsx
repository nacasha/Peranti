import { useEffect } from "react"
import { useLocation } from "wouter"

import { useSelector } from "src/hooks/useSelector"
import { Tool } from "src/models/Tool"
import { activeSessionStore } from "src/stores/activeSessionStore"

export const AppRouteListener = () => {
  const [location, setLocation] = useLocation()
  const sessionId = useSelector(() => activeSessionStore.getActiveTool().sessionId)

  useEffect(() => {
    if (Tool.getToolIdFromSessionId(sessionId) === "") {
      setLocation("/welcome", { replace: true })
    } else {
      setLocation("/", { replace: true })
    }
  }, [sessionId])

  useEffect(() => {
    if (location === "/" && Tool.getToolIdFromSessionId(sessionId) === "") {
      setLocation("/welcome", { replace: true })
    }
  }, [location, sessionId])

  return null
}
