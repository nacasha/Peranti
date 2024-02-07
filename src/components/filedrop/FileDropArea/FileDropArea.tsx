import { useEffect, type FC, useState } from "react"

import { Button } from "src/components/common/Button"
import { FileDropAction } from "src/enums/file-drop-action"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { fileDropService } from "src/services/file-drop-service"
import { windowManager } from "src/services/window-manager"

import "./FileDropArea.scss"

export const FileDropArea: FC = () => {
  const [isChooshingAction, setIsChoosingAction] = useState(false)

  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())
  const isHoveringFile = useSelector(() => fileDropService.isHoveringFile)
  const isDroppingFile = useSelector(() => fileDropService.isDroppingFile)
  const droppedFilePaths = useSelector(() => fileDropService.droppedFilePaths)
  const fileDropAction = useSelector(() => fileDropService.fileDropAction)

  const handleFileDrop = async(filePaths: string[]) => {
    if (filePaths.length > 0) {
      void windowManager.setFocus()

      if (fileDropAction === FileDropAction.AlwaysAsk) {
        setIsChoosingAction(true)
      } else {
        setIsChoosingAction(false)
        await fileDropService.proceedFileDropBasedOnAction()
      }
    }
  }

  const handleClickCancel = () => {
    setIsChoosingAction(false)
    fileDropService.resetState()
  }

  const handleReplaceCurrentSession = () => {
    setIsChoosingAction(false)
    void fileDropService.replaceCurrentSession()
  }

  const handleReplaceCurrentSessionAndOpen = () => {
    setIsChoosingAction(false)
    void fileDropService.replaceCurrentSessionAndOpenNew()
  }

  const handleOpenNewSession = () => {
    setIsChoosingAction(false)
    void fileDropService.openInNewSession()
  }

  useEffect(() => {
    if (isDroppingFile && droppedFilePaths.length > 0) {
      void handleFileDrop(droppedFilePaths)
    }
  }, [droppedFilePaths, isDroppingFile])

  if (!isHoveringFile && !isChooshingAction) {
    return null
  }

  const activeAppletName = activeApplet.name
  const hasMultipleFiles = droppedFilePaths.length > 1

  return (
    <div className="FileDropArea">
      <div className="FileDropArea-body">
        {!isChooshingAction && (
          <div className="FileDropArea-text">
            Drop {droppedFilePaths.length} file{(droppedFilePaths.length > 1) && "s"}
          </div>
        )}

        {isChooshingAction && (
          <div className="FileDropArea-prompt">
            <div className="FileDropArea-prompt-text">
              You have dropped <strong>{droppedFilePaths.length}</strong> file{hasMultipleFiles && "s"}
            </div>

            <div className="FileDropArea-prompt-selection">
              {droppedFilePaths.length === 1
                ? (
                  <div
                    className="FileDropArea-prompt-item"
                    onClick={handleReplaceCurrentSession}
                  >
                    Replace current <strong>{activeAppletName}</strong>
                  </div>
                )
                : (
                  <div
                    className="FileDropArea-prompt-item"
                    onClick={handleReplaceCurrentSessionAndOpen}
                  >
                    Replace current <strong>{activeAppletName}</strong> and
                    {" "} open {droppedFilePaths.length - 1} in new editor(s)
                  </div>
                )}
              <div
                className="FileDropArea-prompt-item"
                onClick={handleOpenNewSession}
              >
                Open in {droppedFilePaths.length} new editor(s) of <strong>{activeAppletName}</strong>
              </div>
            </div>
            <Button onClick={handleClickCancel}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
