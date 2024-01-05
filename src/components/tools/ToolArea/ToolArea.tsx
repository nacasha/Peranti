import { clsx } from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"

import { interfaceStore } from "src/stores/interfaceStore"
import { toolStore } from "src/stores/toolStore"

import { ToolAreaInput } from "./ToolAreaInput.js"
import { ToolAreaOutput } from "./ToolAreaOutput.js"

import "./ToolArea.scss"

import { type ToolInput } from "src/types/ToolInput.ts"
import { type ToolOutput } from "src/types/ToolOutput.ts"

export const ToolArea: FC = observer(() => {
  const textAreaWordWrap = interfaceStore.textAreaWordWrap
  const activeTool = toolStore.getActiveTool()
  const { batchInputKey, batchOutputKey, isBatchEnabled } = activeTool

  const {
    layout = "side-by-side",
    inputs,
    inputsLayoutDirection,
    outputs,
    outputsLayoutDirection
  } = activeTool

  const computedLayout = isBatchEnabled ? "side-by-side" : layout

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

  const computedInputs = isBatchEnabled ? batchInputs : inputs
  const computedOutputs = isBatchEnabled ? batchOutputs : outputs

  return (
    <div className={clsx("ToolArea", computedLayout, textAreaWordWrap && "text-area-word-wrap")}>
      <ToolAreaInput
        toolInstanceId={activeTool.instanceId}
        inputs={computedInputs}
        direction={inputsLayoutDirection}
      />
      <ToolAreaOutput
        toolInstanceId={activeTool.instanceId}
        outputs={computedOutputs}
        direction={outputsLayoutDirection}
      />
    </div>
  )
})
