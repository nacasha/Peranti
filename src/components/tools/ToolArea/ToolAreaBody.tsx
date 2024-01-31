import fastDeepEqual from "fast-deep-equal"
import { memo, type FC } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { type ToolInput } from "src/types/ToolInput.ts"
import { type ToolOutput } from "src/types/ToolOutput.ts"

import { ToolAreaInput } from "./ToolAreaInput.js"
import { ToolAreaOutput } from "./ToolAreaOutput.js"

import "./ToolArea.scss"

interface ToolAreaBodyProps {
  toolSessionId: string
  inputs: ToolInput[]
  inputLayoutDirection?: "horizontal" | "vertical"
  outputs: ToolOutput[]
  outputLayoutDirection?: "horizontal" | "vertical"
  readOnly?: boolean
  hidden?: boolean
  className?: string
}

export const ToolAreaBody: FC<ToolAreaBodyProps> = memo((props) => {
  const {
    inputLayoutDirection,
    inputs,
    outputLayoutDirection,
    outputs,
    toolSessionId,
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
        <ToolAreaInput
          toolSessionId={toolSessionId}
          components={inputs}
          direction={inputLayoutDirection}
          readOnly={readOnly}
          className={className}
        />
      )}
      {outputs.length > 0 && (
        <ToolAreaOutput
          toolSessionId={toolSessionId}
          components={outputs}
          direction={outputLayoutDirection}
          className={className}
        />
      )}
    </ErrorBoundary>
  )
}, fastDeepEqual)
