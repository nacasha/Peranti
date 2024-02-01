import { clsx } from "clsx"
import { observer } from "mobx-react"

import { SelectInput } from "src/components/inputs/SelectInput"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

import "./ToolBatchModeHeader.scss"

export const ToolBatchModeHeader = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()
  const { isBatchModeEnabled: isBatchEnabled, batchModeOutputKey: batchOutputKey, batchModeInputKey: batchInputKey } = activeTool

  const isToolReadOnly = activeTool.isDeleted
  const inputFields = activeTool.getInputFields()
  const outputFields = activeTool.getOutputFields()

  const allowedBatchInputFields = inputFields.filter((input) => input.allowBatch)
  const allowedBatchOutputFields = outputFields.filter((output) => output.allowBatch)

  const onChangeInputKey = (inputKey: string) => {
    activeTool.setBatchModeInputKey(inputKey)
  }

  const onChangeOutputKey = (outputKey: string) => {
    activeTool.setBatchModeOutputKey(outputKey)
  }

  return (
    <div className={clsx("ToolBatchModeHeader", isBatchEnabled && "show")}>
      <div className="ToolHeader-button-list">
        <SelectInput<any>
          options={allowedBatchInputFields.map((input) => ({
            label: input.label,
            value: input.key
          }))}
          defaultValue={batchInputKey}
          onSubmit={onChangeInputKey}
          readOnly={isToolReadOnly}
        />
        <SelectInput
          options={allowedBatchOutputFields.map((output) => ({
            label: output.label,
            value: output.key
          }))}
          defaultValue={batchOutputKey}
          onSubmit={onChangeOutputKey}
          readOnly={isToolReadOnly}
        />
      </div>
    </div>
  )
})
