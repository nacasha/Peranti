import NiceModal from "@ebay/nice-modal-react"
import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Checkbox } from "src/components/common/Checkbox"
import { UpdateDialog } from "src/components/dialog/UpdateDialog"
import { SettingsCard, SettingsCardItem } from "src/components/settings/SettingsCard"
import { appUpdaterService } from "src/services/app-updater-service"

/**
 * Current version and update options. Only the desktop app installs updates,
 * so the web build shows the same rows disabled.
 */
export const SettingsUpdates: FC = observer(() => {
  const { currentVersion, isSupported, isBusy, status, availableVersion, checkOnStartup } = appUpdaterService

  const handleClickCheck = () => {
    void NiceModal.show(UpdateDialog, { check: status !== "available" })
  }

  const getVersionDescription = () => {
    if (!isSupported) return "Available in the desktop app"
    if (status === "available" || status === "downloading") return `v${availableVersion} is available`
    if (status === "installed") return `v${availableVersion} is installed, restart to use it`
    if (status === "upToDate") return "You're on the latest version"
    return undefined
  }

  return (
    <SettingsCard>
      <SettingsCardItem
        label={`Peranti v${currentVersion}`}
        description={getVersionDescription()}
      >
        <Button disabled={!isSupported || isBusy} onClick={handleClickCheck}>
          {status === "available" || status === "installed" ? "View Update" : "Check for Updates"}
        </Button>
      </SettingsCardItem>

      <SettingsCardItem
        label="Check On Startup"
        description="Look for a newer release each time the app starts"
      >
        <Checkbox
          value={checkOnStartup}
          disabled={!isSupported}
          onChange={(value) => { appUpdaterService.setCheckOnStartup(value) }}
        />
      </SettingsCardItem>
    </SettingsCard>
  )
})
