import { observer } from "mobx-react"

import { Checkbox } from "src/components/common/Checkbox"
import { Dropdown } from "src/components/common/Dropdown"
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
    <SecondarySidebarSection padding title="Batch Mode">
      <Checkbox
        value={isBatchModeEnabled}
        onChange={handleToggleBatchMode}
        label="Enable Batch Mode"
      />
      {isBatchModeEnabled && (
        <>
          <div>
            <div>Input</div>
            <Dropdown
              width="100%"
              value={batchModeInputKey}
              options={allowedBatchInputFields.map((input) => ({
                label: input.label,
                value: input.key
              }))}
              onChange={onChangeInputKey}
              readOnly={isDeleted}
            />
          </div>
          <div>
            <div>Output</div>
            <Dropdown
              width="100%"
              value={batchModeOutputKey}
              options={allowedBatchOutputFields.map((output) => ({
                label: output.label,
                value: output.key
              }))}
              onChange={onChangeOutputKey}
              readOnly={isDeleted}
            />
          </div>
        </>
      )}
    </SecondarySidebarSection>
  )
})
