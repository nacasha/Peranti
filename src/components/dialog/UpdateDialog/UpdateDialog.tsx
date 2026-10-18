import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { observer } from "mobx-react"
import { useEffect } from "react"

import { Button } from "src/components/common/Button"
import { appUpdaterService } from "src/services/app-updater-service"

import { Dialog } from "../Dialog"

import "./UpdateDialog.scss"

interface UpdateDialogProps {
  /**
   * Run a check when the dialog opens, for a manual "Check for Updates"
   */
  check?: boolean
}

/**
 * Shows the result of an update check: the newer version and its release
 * notes, then the download progress and a restart once it is installed
 */
export const UpdateDialog = NiceModal.create(observer((props: UpdateDialogProps) => {
  const { check = false } = props
  const modal = useModal()
  const {
    status,
    error,
    currentVersion,
    availableVersion,
    releaseNotes,
    downloadProgress,
    update
  } = appUpdaterService

  useEffect(() => {
    if (check) void appUpdaterService.checkForUpdates()
  }, [])

  const handleClose = () => {
    void modal.hide()
  }

  const handleInstall = () => {
    void appUpdaterService.downloadAndInstall()
  }

  const handleRelaunch = () => {
    void appUpdaterService.relaunch()
  }

  const handleRetry = () => {
    if (update) {
      handleInstall()
    } else {
      void appUpdaterService.checkForUpdates()
    }
  }

  const renderBody = () => {
    switch (status) {
    case "idle":
    case "checking":
      return <div className="UpdateDialog-description">Checking for updates…</div>

    case "upToDate":
      return (
        <div className="UpdateDialog-description">
            v{currentVersion} is the latest version.
        </div>
      )

    case "error":
      return (
        <div className="UpdateDialog-description UpdateDialog-error">
          {update ? "Couldn't install the update" : "Couldn't check for updates"}: {error}
        </div>
      )

    case "installed":
      return (
        <div className="UpdateDialog-description">
            v{availableVersion} is installed. Restart Peranti to start using it.
        </div>
      )

    case "available":
    case "downloading":
      return (
        <>
          <div className="UpdateDialog-description">
              v{availableVersion} is available, you have v{currentVersion}.
          </div>

          {releaseNotes && (
            <div className="UpdateDialog-notes">{releaseNotes}</div>
          )}

          {status === "downloading" && (
            <div className="UpdateDialog-progress">
              <div
                className="UpdateDialog-progress-bar"
                style={{ width: `${Math.round((downloadProgress ?? 0) * 100)}%` }}
              />
            </div>
          )}
        </>
      )
    }
  }

  const renderActions = () => {
    switch (status) {
    case "available":
      return (
        <>
          <Button onClick={handleClose}>Later</Button>
          <Button variant="primary" onClick={handleInstall} autoFocus>Download & Install</Button>
        </>
      )

    case "downloading":
      return (
        <Button variant="primary" disabled>
          {downloadProgress === undefined
            ? "Downloading…"
            : `Downloading ${Math.round(downloadProgress * 100)}%`}
        </Button>
      )

    case "installed":
      return (
        <>
          <Button onClick={handleClose}>Later</Button>
          <Button variant="primary" onClick={handleRelaunch} autoFocus>Restart Now</Button>
        </>
      )

    case "error":
      return (
        <>
          <Button onClick={handleClose}>Close</Button>
          <Button variant="primary" onClick={handleRetry}>Try Again</Button>
        </>
      )

    default:
      return <Button onClick={handleClose} autoFocus>Close</Button>
    }
  }

  return (
    <Dialog maxWidth={460}>
      <Dialog.Content>
        <div className="UpdateDialog">
          <div className="UpdateDialog-title">Software Update</div>
          {renderBody()}
        </div>
      </Dialog.Content>
      <Dialog.Footer>
        {renderActions()}
      </Dialog.Footer>
    </Dialog>
  )
}))
