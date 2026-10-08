import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Input } from "src/components/common/Input"
import { SettingsCard, SettingsCardItem } from "src/components/settings/SettingsCard"
import { sessionHistoryStore } from "src/services/session-history-store"

/**
 * Closed tabs history options. Only the desktop app keeps history, so the web
 * build shows the same rows disabled.
 */
export const SettingsHistory: FC = observer(() => {
  const { featureEnabled, numberOfMaximumHistory, isSupported } = sessionHistoryStore

  /**
   * Committed on blur, not on each keystroke: lowering the maximum drops the
   * oldest entries right away, so a half-typed value must not trim history
   */
  const handleBlurMaximum = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value)

    if (Number.isInteger(value) && value >= 1) {
      void sessionHistoryStore.setNumberOfMaximumHistory(value)
    } else {
      event.currentTarget.value = String(numberOfMaximumHistory)
    }
  }

  const handleKeyDownMaximum = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.currentTarget.blur()
    }
  }

  const handleClickDisable = () => {
    sessionHistoryStore.disableHistoryWithConfirm()
  }

  const handleClickEnable = () => {
    sessionHistoryStore.setFeatureEnabled(true)
  }

  return (
    <SettingsCard>
      <SettingsCardItem
        label="Save Closed Tabs"
        description={isSupported ? "Keep closed tabs so you can reopen them later" : "Available in the desktop app"}
      >
        {featureEnabled
          ? (
            <Button disabled={!isSupported} onClick={handleClickDisable}>Disable</Button>
          )
          : (
            <Button disabled={!isSupported} onClick={handleClickEnable}>Enable</Button>
          )}
      </SettingsCardItem>

      <SettingsCardItem
        label="Maximum Entries"
        description="Lowering this removes the oldest closed tabs right away"
      >
        <Input
          type="number"
          min={1}
          step={1}
          defaultValue={numberOfMaximumHistory}
          disabled={!isSupported}
          onBlur={handleBlurMaximum}
          onKeyDown={handleKeyDownMaximum}
          style={{ width: 96 }}
        />
      </SettingsCardItem>
    </SettingsCard>
  )
})
