import { clsx } from "clsx"
import fastDeepEqual from "fast-deep-equal"
import { memo, type FC } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { useSelector } from "src/hooks/useSelector.js"
import { interfaceStore } from "src/stores/interfaceStore.js"
import { toolRunnerStore } from "src/stores/toolRunnerStore.js"
import { type ToolInput } from "src/types/ToolInput.ts"
import { type ToolOutput } from "src/types/ToolOutput.ts"

import { ToolAreaInput } from "./ToolAreaInput.js"
import { ToolAreaOutput } from "./ToolAreaOutput.js"

import "./ToolArea.scss"

export const ToolArea: FC = () => {
  const sessionId = useSelector(() => toolRunnerStore.getActiveTool().sessionId)
  const renderCounter = useSelector(() => toolRunnerStore.getActiveTool().renderCounter)
  const batchInputKey = useSelector(() => toolRunnerStore.getActiveTool().batchInputKey)
  const batchOutputKey = useSelector(() => toolRunnerStore.getActiveTool().batchOutputKey)
  const isBatchEnabled = useSelector(() => toolRunnerStore.getActiveTool().isBatchEnabled)
  const layoutSetting = useSelector(() => toolRunnerStore.getActiveTool().layoutSetting)
  const isDeleted = useSelector(() => toolRunnerStore.getActiveTool().isDeleted)
  const inputs = useSelector(() => toolRunnerStore.getActiveTool().getInputFields())
  const outputs = useSelector(() => toolRunnerStore.getActiveTool().getOutputFields())

  const { inputAreaDirection, outputAreaDirection } = layoutSetting

  const batchInput = inputs.find((input) => input.key === batchInputKey)
  const batchOutput = outputs.find((output) => output.key === batchOutputKey)

  const batchInputs: ToolInput[] = batchInput
    ? [
      {
        key: batchInput.key,
        label: batchInput.label,
        component: "Code",
        defaultValue: ""
      }
    ]
    : []

  const batchOutputs: ToolOutput[] = batchOutput
    ? [
      {
        key: batchOutput.key,
        label: batchOutput.label,
        component: "Code"
      }
    ]
    : []

  const computedInputs = isBatchEnabled ? batchInputs : inputs
  const computedOutputs = isBatchEnabled ? batchOutputs : outputs

  return (
    <ToolAreaContainer>
      <ToolAreaBody
        toolSessionId={sessionId.concat(renderCounter.toString())}
        inputs={computedInputs}
        outputs={computedOutputs}
        inputLayoutDirection={inputAreaDirection}
        outputLayoutDirection={outputAreaDirection}
        readOnly={isDeleted}
      />
    </ToolAreaContainer>
  )
}

const ToolAreaContainer: FC<{ children: React.ReactNode }> = ({ children }) => {
  const isBatchEnabled = useSelector(() => toolRunnerStore.getActiveTool().isBatchEnabled)
  const layoutSetting = useSelector(() => toolRunnerStore.getActiveTool().layoutSetting)
  const textAreaWordWrap = useSelector(() => interfaceStore.textAreaWordWrap)

  const { direction, reversed, inputAreaSize, outputAreaSize } = layoutSetting

  const computedLayoutDirection = isBatchEnabled ? "horizontal-batch" : direction
  const isLayoutHorizontal = computedLayoutDirection === "horizontal"

  const computedStyles = isLayoutHorizontal
    ? {
      gridTemplateColumns: `${inputAreaSize} ${outputAreaSize}`
    }
    : {
      gridTemplateRows: `${inputAreaSize} ${outputAreaSize}`
    }

  const classNames = {
    "text-area-word-wrap": textAreaWordWrap,
    reversed
  }

  return (
    <div className={clsx("ToolArea", computedLayoutDirection, classNames)} style={computedStyles}>
      {children}
    </div>
  )
}

interface ToolAreaBodyProps {
  toolSessionId: string
  inputs: ToolInput[]
  inputLayoutDirection?: "horizontal" | "vertical"
  outputs: ToolOutput[]
  outputLayoutDirection?: "horizontal" | "vertical"
  readOnly?: boolean
}

const ToolAreaBody: FC<ToolAreaBodyProps> = memo((props) => {
  const {
    inputLayoutDirection,
    inputs,
    outputLayoutDirection,
    outputs,
    toolSessionId,
    readOnly
  } = props

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ToolAreaInput
        toolSessionId={toolSessionId}
        components={inputs}
        direction={inputLayoutDirection}
        readOnly={readOnly}
      />
      <ToolAreaOutput
        toolSessionId={toolSessionId}
        components={outputs}
        direction={outputLayoutDirection}
      />
    </ErrorBoundary>
  )
}, fastDeepEqual)
