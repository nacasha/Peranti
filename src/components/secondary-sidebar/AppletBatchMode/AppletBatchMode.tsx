import { observer } from "mobx-react"

import { Checkbox } from "src/components/common/Checkbox"
import { Dropdown } from "src/components/common/Dropdown"
import { PopoverConfirm } from "src/components/common/PopoverConfirm"
import { SecondarySidebarSection } from "src/components/sidebar/SecondarySidebar"
import { Icons } from "src/constants/icons"
import { SecondarySidebarSections } from "src/constants/secondary-sidebar-sections"
import { activeAppletStore } from "src/services/active-applet-store"

export const AppletBatchMode = observer(() => {
  const activeApplet = activeAppletStore.getActiveApplet()
  const hasBatchMode = activeAppletStore.getActiveApplet().hasBatchMode
  const inputFields = activeApplet.getInputFields()
  const outputFields = activeApplet.getOutputFields()
  const { isBatchModeEnabled, batchModeOutputKey, batchModeInputKey, isDeleted } = activeApplet

  const handleToggleBatchMode = (value: boolean) => {
    activeAppletStore.setBatchMode(value)
  }

  const allowedBatchInputFields = inputFields.filter((input) => input.allowBatch)
  const allowedBatchOutputFields = outputFields.filter((output) => output.allowBatch)

  const onChangeInputKey = (inputKey: string) => {
    activeApplet.setBatchModeInputKey(inputKey)
  }

  const onChangeOutputKey = (outputKey: string) => {
    activeApplet.setBatchModeOutputKey(outputKey)
  }

  return (
    <SecondarySidebarSection
      sectionKey={SecondarySidebarSections.BatchMode}
      hidden={!hasBatchMode}
      title="Batch Mode"
      icon={Icons.Layers}
    >
      <div className="SidebarRow">
        <PopoverConfirm
          confirmation={() => activeAppletStore.getToggleBatchModeConfirmation()}
          onConfirm={() => { handleToggleBatchMode(false) }}
          placement="bottomLeft"
        >
          <Checkbox
            value={isBatchModeEnabled}
            onChange={handleToggleBatchMode}
            label="Enable Batch Mode"
          />
        </PopoverConfirm>
      </div>
      {isBatchModeEnabled && (
        <>
          <div className="SidebarRow">
            <div className="SidebarRow-label">Input</div>
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
          <div className="SidebarRow">
            <div className="SidebarRow-label">Output</div>
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
