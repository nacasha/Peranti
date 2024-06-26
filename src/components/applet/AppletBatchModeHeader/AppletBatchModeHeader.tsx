import { clsx } from "clsx"
import { observer } from "mobx-react"

import { SelectInput } from "src/components/inputs/SelectInput"
import { activeAppletStore } from "src/services/active-applet-store"

import "./AppletBatchModeHeader.scss"

export const AppletBatchModeHeader = observer(() => {
  const activeApplet = activeAppletStore.getActiveApplet()
  const { isBatchModeEnabled, batchModeOutputKey, batchModeInputKey } = activeApplet

  const isReadOnly = activeApplet.isDeleted
  const inputFields = activeApplet.getInputFields()
  const outputFields = activeApplet.getOutputFields()

  const allowedBatchInputFields = inputFields.filter((input) => input.allowBatch)
  const allowedBatchOutputFields = outputFields.filter((output) => output.allowBatch)

  const onChangeInputKey = (inputKey: string) => {
    activeApplet.setBatchModeInputKey(inputKey)
  }

  const onChangeOutputKey = (outputKey: string) => {
    activeApplet.setBatchModeOutputKey(outputKey)
  }

  return (
    <div className={clsx("AppletBatchModeHeader", isBatchModeEnabled && "show")}>
      <div className="AppletBatchModeHeader-button-list">
        <SelectInput
          fieldKey=""
          options={allowedBatchInputFields.map((input) => ({
            label: input.label,
            value: input.key
          }))}
          value={batchModeInputKey}
          onValueChange={onChangeInputKey}
          readOnly={isReadOnly}
        />
        <SelectInput
          fieldKey=""
          options={allowedBatchOutputFields.map((output) => ({
            label: output.label,
            value: output.key
          }))}
          value={batchModeOutputKey}
          onValueChange={onChangeOutputKey}
          readOnly={isReadOnly}
        />
      </div>
    </div>
  )
})
