import { useEffect } from "react"
import { useLocation } from "wouter"

import { useSelector } from "src/hooks/useSelector"
import { Tool } from "src/models/Tool"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

export const AppRouteListener = () => {
  const [location, setLocation] = useLocation()
  const sessionId = useSelector(() => toolRunnerStore.getActiveTool().sessionId)

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