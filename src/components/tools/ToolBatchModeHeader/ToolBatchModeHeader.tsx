import { clsx } from "clsx"
import { observer } from "mobx-react"

import { SelectInput } from "src/components/inputs/SelectInput"
import { toolStore } from "src/stores/toolStore"

import "./ToolBatchModeHeader.scss"

export const ToolBatchModeHeader = observer(() => {
  const activeTool = toolStore.getActiveTool()
  const { isBatchEnabled, batchOutputKey, batchInputKey } = activeTool

  const isToolReadOnly = activeTool.isReadOnly
  const inputFields = activeTool.getInputFields()
  const outputFields = activeTool.getOutputFields()

  const allowedBatchInputFields = inputFields.filter((input) => input.allowBatch)
  const allowedBatchOutputFields = outputFields.filter((output) => output.allowBatch)

  const onChangeInputKey = (inputKey: string) => {
    activeTool.setBatchInputKey(inputKey)
  }

  const onChangeOutputKey = (outputKey: string) => {
    activeTool.setBatchOutputKey(outputKey)
  }

  return (
    <div className={clsx("ToolBatchModeHeader", isBatchEnabled && "show")}>
      <div className="ToolHeader-button-list">
        <SelectInput<any>
          options={allowedBatchInputFields.map((input) => ({
            label: input.label,
            value: input.key
          }))}
          initialValue={batchInputKey}
          onSubmit={onChangeInputKey}
          readOnly={isToolReadOnly}
        />
        <SelectInput
          options={allowedBatchOutputFields.map((output) => ({
            label: output.label,
            value: output.key
          }))}
          initialValue={batchOutputKey}
          onSubmit={onChangeOutputKey}
          readOnly={isToolReadOnly}
        />
      </div>
    </div>
  )
})
