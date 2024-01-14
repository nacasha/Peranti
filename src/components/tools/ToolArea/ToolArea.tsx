import { clsx } from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"

import { ToolLayoutEnum } from "src/enums/ToolLayoutEnum.ts"
import { interfaceStore } from "src/stores/interfaceStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore.js"
import { type ToolInput } from "src/types/ToolInput.ts"
import { type ToolOutput } from "src/types/ToolOutput.ts"

import { ToolAreaInput } from "./ToolAreaInput.js"
import { ToolAreaOutput } from "./ToolAreaOutput.js"

import "./ToolArea.scss"

export const ToolArea: FC = observer(() => {
  const textAreaWordWrap = interfaceStore.textAreaWordWrap
  const activeTool = toolRunnerStore.getActiveTool()
  const { batchInputKey, batchOutputKey, isBatchEnabled } = activeTool

  const {
    layout,
    layoutReversed,
    inputsLayoutDirection,
    outputsLayoutDirection
  } = activeTool

  const inputs = activeTool.getInputFields()
  const outputs = activeTool.getOutputFields()

  const computedLayout = isBatchEnabled ? ToolLayoutEnum.SideBySide : layout

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

  const classNames = {
    "text-area-word-wrap": textAreaWordWrap,
    reversed: layoutReversed
  }

  return (
    <div className={clsx("ToolArea", computedLayout, classNames)}>
      <ToolAreaInput
        toolSessionId={activeTool.sessionId}
        inputs={computedInputs}
        direction={inputsLayoutDirection}
      />
      <ToolAreaOutput
        toolSessionId={activeTool.sessionId}
        outputs={computedOutputs}
        direction={outputsLayoutDirection}
      />
    </div>
  )
})
