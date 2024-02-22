import { observer } from "mobx-react"

import { Switch } from "src/components/common/Switch"
import { SelectInput } from "src/components/inputs/SelectInput"
import { SecondarySidebarSection } from "src/components/sidebar/SecondarySidebar"
import { activeAppletStore } from "src/services/active-applet-store"

export const AppletBatchMode = observer(() => {
  const activeApplet = activeAppletStore.getActiveApplet()
  const hasBatchMode = activeAppletStore.getActiveApplet().hasBatchMode
  const inputFields = activeApplet.getInputFields()
  const outputFields = activeApplet.getOutputFields()
  const { isBatchModeEnabled, batchModeOutputKey, batchModeInputKey, isDeleted } = activeApplet

  const handleToggleBatchMode = (value: boolean) => {
    activeAppletStore.getActiveApplet().setBatchMode(value)
  }

  const allowedBatchInputFields = inputFields.filter((input) => input.allowBatch)
  const allowedBatchOutputFields = outputFields.filter((output) => output.allowBatch)

  const onChangeInputKey = (inputKey: string) => {
    activeApplet.setBatchModeInputKey(inputKey)
  }

  const onChangeOutputKey = (outputKey: string) => {
    activeApplet.setBatchModeOutputKey(outputKey)
  }

  if (!hasBatchMode) {
    return null
  }

  return (
    <SecondarySidebarSection title={(
      <>
        <div>
          Batch Mode
        </div>
        <Switch
          value={isBatchModeEnabled}
          onChange={handleToggleBatchMode}
        />
      </>
    )}
    >
      <>
        <SelectInput
          label="Input"
          options={allowedBatchInputFields.map((input) => ({
            label: input.label,
            value: input.key
          }))}
          defaultValue={batchModeInputKey}
          onValueChange={onChangeInputKey}
          readOnly={isDeleted}
        />
        <SelectInput
          label="Output"
          options={allowedBatchOutputFields.map((output) => ({
            label: output.label,
            value: output.key
          }))}
          defaultValue={batchModeOutputKey}
          onValueChange={onChangeOutputKey}
          readOnly={isDeleted}
        />
      </>
    </SecondarySidebarSection>
  )
})
