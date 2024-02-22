import { type FC } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { Button } from "src/components/common/Button/Button.tsx"

import { AppletComponentAreaInput } from "./AppletComponentAreaInput.tsx"
import { AppletComponentAreaOutput } from "./AppletComponentAreaOutput.tsx"

interface AppletComponentAreaBodyProps {
  hidden?: boolean
  className?: string
}

export const AppletComponentAreaBody: FC<AppletComponentAreaBodyProps> = (props) => {
  const { hidden, className } = props

  if (hidden) {
    return
  }

  return (
    <ErrorBoundary fallback={<FallBack />}>
      <AppletComponentAreaInput className={className} />
      <AppletComponentAreaOutput className={className} />
    </ErrorBoundary>
  )
}

const FallBack: FC = () => {
  const handleReload = () => {
    window.location.href = "/"
  }

  return (
    <div>
      <div>Something went wrong</div>
      <Button onClick={handleReload}>Reload</Button>
    </div>
  )
}
