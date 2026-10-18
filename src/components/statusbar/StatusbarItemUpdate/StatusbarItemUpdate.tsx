import NiceModal from "@ebay/nice-modal-react"

import { UpdateDialog } from "src/components/dialog/UpdateDialog"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { appUpdaterService } from "src/services/app-updater-service"

/**
 * Shown only once a newer version has been found, until the app restarts
 */
export const StatusbarItemUpdate = () => {
  const status = useSelector(() => appUpdaterService.status)
  const availableVersion = useSelector(() => appUpdaterService.availableVersion)

  if (status !== "available" && status !== "downloading" && status !== "installed") {
    return null
  }

  const handleClick = () => {
    void NiceModal.show(UpdateDialog)
  }

  return (
    <div className="Statusbar-item StatusbarItemUpdate" onClick={handleClick}>
      <Icons.Download size={12} aria-hidden />
      {status === "installed" ? "Restart to Update" : `Update to v${availableVersion}`}
    </div>
  )
}
