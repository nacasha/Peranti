import { type FC } from "react"

import { useSelector } from "src/hooks/useSelector.js"
import { toolRunnerStore } from "src/stores/toolRunnerStore.js"
import { type ToolInput } from "src/types/ToolInput.ts"
import { type ToolOutput } from "src/types/ToolOutput.ts"

import { ToolAreaBody } from "./ToolAreaBody.js"
import { ToolAreaContainer } from "./ToolAreaContainer.js"

import "./ToolArea.scss"

export const ToolArea: FC = () => {
  const activeTool = useSelector(() => toolRunnerStore.getActiveTool())
  const {
    batchInputKey,
    batchOutputKey,
    isBatchEnabled,
    isDeleted,
    layoutSetting,
    renderCounter,
    sessionId
  } = activeTool

  const inputFields = activeTool.getInputFields()
  const outputFields = activeTool.getOutputFields()

  const { inputAreaDirection, outputAreaDirection } = layoutSetting

  const batchInput = inputFields.find((input) => input.key === batchInputKey)
  const batchOutput = outputFields.find((output) => output.key === batchOutputKey)

  const batchInputs: ToolInput[] = batchInput
    ? [{
      key: batchInput.key,
      label: batchInput.label,
      component: "Code",
      defaultValue: ""
    }]
    : []

  const batchOutputs: ToolOutput[] = batchOutput
    ? [{
      key: batchOutput.key,
      label: batchOutput.label,
      component: "Code"
    }]
    : []

  const computedInputs = isBatchEnabled ? batchInputs : inputFields
  const computedOutputs = isBatchEnabled ? batchOutputs : outputFields

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
