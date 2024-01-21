import { clsx } from "clsx"
import fastDeepEqual from "fast-deep-equal"
import { observer } from "mobx-react"
import { memo, type FC } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { toolRunnerStore } from "src/stores/toolRunnerStore.js"
import { type ToolInput } from "src/types/ToolInput.ts"
import { type ToolOutput } from "src/types/ToolOutput.ts"

import { ToolAreaInput } from "./ToolAreaInput.js"
import { ToolAreaOutput } from "./ToolAreaOutput.js"

import "./ToolArea.scss"

export const ToolArea: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()
  const { batchInputKey, batchOutputKey, isBatchEnabled, layoutSetting, isReadOnly } = activeTool
  const { direction, reversed, inputAreaDirection, inputAreaSize, outputAreaDirection, outputAreaSize } = layoutSetting

  const inputs = activeTool.getInputFields()
  const outputs = activeTool.getOutputFields()

  const batchInput = inputs.find((input) => input.key === batchInputKey)
  const batchOutput = outputs.find((output) => output.key === batchOutputKey)

  const batchInputs: ToolInput[] = batchInput
    ? [
      {
        key: batchInput.key,
        label: batchInput.label,
        component: "Textarea",
        defaultValue: ""
      }
    ]
    : []

  const batchOutputs: ToolOutput[] = batchOutput
    ? [
      {
        key: batchOutput.key,
        label: batchOutput.label,
        component: "Textarea"
      }
    ]
    : []

  const computedLayoutDirection = isBatchEnabled ? "horizontal-batch" : direction
  const isLayoutHorizontal = computedLayoutDirection === "horizontal"

  const computedInputs = isBatchEnabled ? batchInputs : inputs
  const computedOutputs = isBatchEnabled ? batchOutputs : outputs
  const computedStyles = isLayoutHorizontal
    ? {
      gridTemplateColumns: `${inputAreaSize} ${outputAreaSize}`
    }
    : {
      gridTemplateRows: `${inputAreaSize} ${outputAreaSize}`
    }

  const classNames = {
    reversed
  }

  return (
    <div className={clsx("ToolArea", computedLayoutDirection, classNames)} style={computedStyles}>
      <ToolAreaBody
        toolSessionId={activeTool.sessionId}
        inputs={computedInputs}
        outputs={computedOutputs}
        inputLayoutDirection={inputAreaDirection}
        outputLayoutDirection={outputAreaDirection}
        readOnly={isReadOnly}
      />
    </div>
  )
})

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
