import { clsx } from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"

import { toolRunnerStore } from "src/stores/toolRunnerStore.js"
import { type ToolInput } from "src/types/ToolInput.ts"
import { type ToolOutput } from "src/types/ToolOutput.ts"

import { ToolAreaInput } from "./ToolAreaInput.js"
import { ToolAreaOutput } from "./ToolAreaOutput.js"

import "./ToolArea.scss"

export const ToolArea: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()
  const { batchInputKey, batchOutputKey, isBatchEnabled, layoutSetting } = activeTool
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
      {computedInputs.length > 0 && (
        <ToolAreaInput
          toolSessionId={activeTool.sessionId}
          inputs={computedInputs}
          direction={inputAreaDirection}
        />
      )}
      {computedOutputs.length > 0 && (
        <ToolAreaOutput
          toolSessionId={activeTool.sessionId}
          outputs={computedOutputs}
          direction={outputAreaDirection}
        />
      )}
    </div>
  )
})
