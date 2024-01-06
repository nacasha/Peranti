import { clsx } from "clsx"
import { observer } from "mobx-react"

import { SelectInput } from "src/components/inputs/SelectInput"
import { toolStore } from "src/stores/toolStore"

import "./ToolBatchModeHeader.scss"

export const ToolBatchModeHeader = observer(() => {
  const activeTool = toolStore.getActiveTool()
  const { isBatchEnabled, batchOutputKey, batchInputKey, isReadOnly } = activeTool

  const inputs = activeTool.getInputs()
  const outputs = activeTool.getOutputs()

  const allowedBatchInputFields = inputs.filter((input) => input.allowBatch)
  const allowedBatchOutputFields = outputs.filter((output) => output.allowBatch)

  const onChangeInputKey = (inputKey: string) => {
    activeTool.batchInputKey = inputKey
  }

  const onChangeOutputKey = (outputKey: string) => {
    activeTool.batchOutputKey = outputKey
  }

  return (
    <div className={clsx("ToolBatchModeHeader", isBatchEnabled && "show")}>
      <div className="ToolHeader-button-list">
        <SelectInput
          options={allowedBatchInputFields.map((input) => ({
            label: input.label,
            value: input.key
          }))}
          initialValue={batchInputKey}
          onSubmit={onChangeInputKey}
          readOnly={isReadOnly}
        />
        <SelectInput
          options={allowedBatchOutputFields.map((output) => ({
            label: output.label,
            value: output.key
          }))}
          initialValue={batchOutputKey}
          onSubmit={onChangeOutputKey}
          readOnly={isReadOnly}
        />
      </div>
    </div>
  )
})
