import NiceModal from "@ebay/nice-modal-react"
import { type FC, useEffect } from "react"
import toast from "react-hot-toast"

import { UpdateDialog } from "src/components/dialog/UpdateDialog"
import { appUpdaterService } from "src/services/app-updater-service"

/**
 * Wait after startup before checking, so the request doesn't compete with
 * loading extensions and restoring tabs
 */
const STARTUP_CHECK_DELAY = 5000

const TOAST_ID = "app-update-available"

/**
 * Checks for a newer release once on startup, quietly: only a found update is
 * reported, never "up to date" or a failed request
 */
export const AppUpdateListener: FC = () => {
  useEffect(() => {
    // A dev build would replace itself with the released bundle
    if (import.meta.env.DEV) return
    if (!appUpdaterService.isSupported || !appUpdaterService.checkOnStartup) return

    const timeout = setTimeout(() => {
      void appUpdaterService.checkForUpdates().then((hasUpdate) => {
        if (!hasUpdate) return

        toast((t) => (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              toast.dismiss(t.id)
              void NiceModal.show(UpdateDialog)
            }}
          >
            Peranti v{appUpdaterService.availableVersion} is available. Click to update.
          </span>
        ), { id: TOAST_ID, duration: 10000 })
      })
    }, STARTUP_CHECK_DELAY)

    return () => { clearTimeout(timeout) }
  }, [])

  return null
}
