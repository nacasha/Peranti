import { useEffect, type FC, useState } from "react"

import { Button } from "src/components/common/Button"
import { useSelector } from "src/hooks/useSelector"
import { windowManager } from "src/services/windowManager"
import { FileDropAction, fileDropStore } from "src/stores/fileDropStore"
import { activeSessionStore } from "src/stores/activeSessionStore"

import "./FileDropArea.scss"

export const FileDropArea: FC = () => {
  const [isChooshingAction, setIsChoosingAction] = useState(false)

  const activeTool = useSelector(() => activeSessionStore.getActiveTool())
  const isHoveringFile = useSelector(() => fileDropStore.isHoveringFile)
  const isDroppingFile = useSelector(() => fileDropStore.isDroppingFile)
  const droppedFilePaths = useSelector(() => fileDropStore.droppedFilePaths)
  const fileDropAction = useSelector(() => fileDropStore.fileDropAction)

  const handleFileDrop = async(filePaths: string[]) => {
    if (filePaths.length > 0) {
      void windowManager.setFocus()

      if (fileDropAction === FileDropAction.AlwaysAsk) {
        setIsChoosingAction(true)
      } else {
        setIsChoosingAction(false)
        await fileDropStore.proceedFileDropBasedOnAction()
      }
    }
  }

  const handleClickCancel = () => {
    setIsChoosingAction(false)
    fileDropStore.resetState()
  }

  const handleReplaceCurrentTool = () => {
    setIsChoosingAction(false)
    void fileDropStore.replaceCurrentTool()
  }

  const handleReplaceCurrentToolAndOpen = () => {
    setIsChoosingAction(false)
    void fileDropStore.replaceCurrentToolAndOpenNew()
  }

  const handleOpenNewSession = () => {
    setIsChoosingAction(false)
    void fileDropStore.openInNewSession()
  }

  useEffect(() => {
    if (isDroppingFile && droppedFilePaths.length > 0) {
      void handleFileDrop(droppedFilePaths)
    }
  }, [droppedFilePaths, isDroppingFile])

  if (!isHoveringFile && !isChooshingAction) {
    return null
  }

  const activeToolName = activeTool.name
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
                    onClick={handleReplaceCurrentTool}
                  >
                    Replace current <strong>{activeToolName}</strong>
                  </div>
                )
                : (
                  <div
                    className="FileDropArea-prompt-item"
                    onClick={handleReplaceCurrentToolAndOpen}
                  >
                    Replace current <strong>{activeToolName}</strong> and
                    {" "} open {droppedFilePaths.length - 1} in new editor(s)
                  </div>
                )}
              <div
                className="FileDropArea-prompt-item"
                onClick={handleOpenNewSession}
              >
                Open in {droppedFilePaths.length} new editor(s) of <strong>{activeToolName}</strong>
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
