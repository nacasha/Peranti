import fastDeepEqual from "fast-deep-equal"
import { memo, type FC } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { type AppletInput } from "src/types/AppletInput.ts"
import { type AppletOutput } from "src/types/AppletOutput.ts"

import { AppletComponentAreaInput } from "./AppletComponentAreaInput.tsx"
import { AppletComponentAreaOutput } from "./AppletComponentAreaOutput.tsx"

interface AppletComponentAreaBodyProps {
  appletSessionId: string
  inputs: AppletInput[]
  inputLayoutDirection?: "horizontal" | "vertical"
  outputs: AppletOutput[]
  outputLayoutDirection?: "horizontal" | "vertical"
  readOnly?: boolean
  hidden?: boolean
  className?: string
}

export const AppletComponentAreaBody: FC<AppletComponentAreaBodyProps> = memo((props) => {
  const {
    inputLayoutDirection,
    inputs,
    outputLayoutDirection,
    outputs,
    appletSessionId,
    readOnly,
    hidden,
    className
  } = props

  if (hidden) {
    return
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      {inputs.length > 0 && (
        <AppletComponentAreaInput
          appletSessionId={appletSessionId}
          components={inputs}
          direction={inputLayoutDirection}
          readOnly={readOnly}
          className={className}
        />
      )}
      {outputs.length > 0 && (
        <AppletComponentAreaOutput
          appletSessionId={appletSessionId}
          components={outputs}
          direction={outputLayoutDirection}
          className={className}
        />
      )}
    </ErrorBoundary>
  )
}, fastDeepEqual)
