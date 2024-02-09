import fastDeepEqual from "fast-deep-equal"
import { memo, type FC } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { AppletComponentAreaInput } from "./AppletComponentAreaInput.tsx"
import { AppletComponentAreaOutput } from "./AppletComponentAreaOutput.tsx"

interface AppletComponentAreaBodyProps {
  hidden?: boolean
  className?: string
}

export const AppletComponentAreaBody: FC<AppletComponentAreaBodyProps> = memo((props) => {
  const { hidden, className } = props

  if (hidden) {
    return
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <AppletComponentAreaInput className={className} />
      <AppletComponentAreaOutput className={className} />
    </ErrorBoundary>
  )
}, fastDeepEqual)
