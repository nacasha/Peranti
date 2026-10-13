import { type FC } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { AppletErrorFallback } from "src/components/applet/AppletErrorFallback"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

import { AppletComponentAreaInput } from "./AppletComponentAreaInput.tsx"
import { AppletComponentAreaOutput } from "./AppletComponentAreaOutput.tsx"

interface AppletComponentAreaBodyProps {
  hidden?: boolean
  className?: string
}

export const AppletComponentAreaBody: FC<AppletComponentAreaBodyProps> = (props) => {
  const { hidden, className } = props

  // A crash in one tab is cleared on switching to another
  const sessionId = useSelector(() => activeAppletStore.getActiveApplet().sessionId)

  if (hidden) {
    return
  }

  return (
    <ErrorBoundary FallbackComponent={AppletErrorFallback} resetKeys={[sessionId]}>
      <AppletComponentAreaInput className={className} />
      <AppletComponentAreaOutput className={className} />
    </ErrorBoundary>
  )
}
