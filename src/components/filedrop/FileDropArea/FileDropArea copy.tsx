import mime from "mime"
import { useEffect, type FC, useState } from "react"

import { Button } from "src/components/common/Button"
import { useSelector } from "src/hooks/useSelector"
import { toolComponentService } from "src/services/toolComponentService"
import { windowManager } from "src/services/windowManager"
import { fileDropStore } from "src/stores/fileDropStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

import "./FileDropArea.scss"

export const FileDropArea: FC = () => {
  const [isChoosingInput, setIsChoosingInput] = useState(true)
  const [droppedFiles, setDroppedFiles] = useState<string[]>([])
  const [isFieldsMatch, setFieldMatch] = useState(false)
  const [supportedFields, setSupportedFields] = useState<string[]>([])
  const [supportedFiles, setSupportedFiles] = useState<string[]>([])

  const isHovering = useSelector(() => fileDropStore.isHoveringFile)

  const hoveringFilePaths = useSelector(() => fileDropStore.hoveringFilePaths)
  const droppedFilePaths = useSelector(() => fileDropStore.droppedFilePaths)

  const activeTool = useSelector(() => toolRunnerStore.getActiveTool())
  const { isBatchModeEnabled } = activeTool

  const handleFileDrop = async(filePaths: string[]) => {
    /**
     * Clear dropped file paths
     */
    setDroppedFiles(filePaths)
    fileDropStore.setDroppedFilePaths([])

    if (filePaths.length > 0) {
      /**
       * Set focus to window after dropping the file(s)
       */
      setIsChoosingInput(true)
      void windowManager.setFocus()

      const filePath = filePaths[0]
      const mimeType = mime.getType(filePath) ?? "_"

      /**
       * Exit when app unable to recognize mime type of file
       */
      // if (mimeType === null) {
      //   setIsChoosingInput(false)
      //   return
      // }

      const supportedFiles = filePaths.filter((fileP) => {
        const fileMimeType = mime.getType(fileP) ?? "_"
        const [inputFields] = activeTool.getInputFieldsWithMime(fileMimeType)
        return inputFields.length > 0
      })

      console.log(supportedFiles.length, droppedFiles.length)

      /**
       * Filter supported input fields that matches the mime types
       */
      // const [inputFields, isAvailableOnBatchMode] = activeTool.getInputFieldsWithMime(mimeType)
      // setSupportedFields(inputFields.map((inputField) => inputField.key))

      // /**
      //  * No supported mimes for currently active tool input fields
      //  */
      // if (inputFields.length === 0) {
      //   setIsChoosingInput(false)
      //   return
      // }

      try {
        // setFieldMatch(inputFields.length >= filePaths.length)

        const { key: inputFieldKey, component } = inputFields[0]
        const inputComponent = toolComponentService.getInputComponent(component, isAvailableOnBatchMode)
        const fileContent = await toolComponentService.readFileFromToolComponent(inputComponent, filePath)

        if (fileContent) {
          /**
           * Switch to batch mode if the tool has batch fields with matching mimeType
           */
          if (!isBatchModeEnabled && isAvailableOnBatchMode) {
            activeTool.setBatchMode(true)
          }

          activeTool.setInputValue(inputFieldKey, fileContent)
          activeTool.resetInputAndOutputFieldsState()
          activeTool.forceRerender()
        }
      } catch (exception) {
        console.log(exception)
        setIsChoosingInput(false)
      }
    }
  }

  const handleClickCancel = () => {
    setIsChoosingInput(false)
    fileDropStore.setDroppedFilePaths([])
  }

  const handleFillCurrentTool = () => {

  }

  const handleOpenNewSession = () => {

  }

  useEffect(() => {
    if (droppedFilePaths.length > 0) {
      void handleFileDrop(droppedFilePaths)
    }
  }, [droppedFilePaths])

  if (!isHovering && !isChoosingInput) {
    return null
  }

  const activeToolName = activeTool.name
  const hasMultipleFiles = droppedFiles.length > 1

  return (
    <div className="FileDropArea">
      <div className="FileDropArea-body">
        {!isChoosingInput && (
          <div className="FileDropArea-text">
            Drop {hoveringFilePaths.length} file{(hoveringFilePaths.length > 1) && "s"}
          </div>
        )}

        {isChoosingInput && (
          <div className="FileDropArea-prompt">
            <div className="FileDropArea-prompt-text">
              You have dropped <strong>{droppedFiles.length}</strong> file{hasMultipleFiles && "s"}
            </div>

            <div className="FileDropArea-prompt-selection">
              {droppedFiles.length === 1 && (
                <div
                  className="FileDropArea-prompt-item"
                  onClick={handleFillCurrentTool}
                >
                  Open in current <strong>{activeToolName}</strong>
                </div>
              )}
              <div
                className="FileDropArea-prompt-item"
                onClick={handleOpenNewSession}
              >
                Open {droppedFiles.length} new editor(s) of <strong>{activeToolName}</strong>
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
