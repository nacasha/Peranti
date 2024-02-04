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
  const [isChoosingInput, setIsChoosingInput] = useState(false)
  const [, setFields] = useState<string[]>([])

  const isHovering = useSelector(() => fileDropStore.isHovering)
  const droppedFilePaths = useSelector(() => fileDropStore.droppedFilePaths)
  const activeTool = useSelector(() => toolRunnerStore.getActiveTool())
  const { isBatchModeEnabled } = activeTool

  const handleFileDrop = async(filePaths: string[]) => {
    /**
     * Clear dropped file paths on store
     */
    fileDropStore.setDroppedFilePaths([])

    if (filePaths.length > 0) {
      /**
       * Set focus to window after dropping the file(s)
       */
      setIsChoosingInput(true)
      void windowManager.setFocus()

      const filePath = filePaths[0]
      const mimeType = mime.getType(filePath)

      /**
       * Exit when app unable to recognize mime type of file
       */
      if (mimeType === null) {
        setIsChoosingInput(false)
        return
      }

      /**
       * Filter supported input fields that matches the mime types
       */
      const [inputFields, isAvailableOnBatchMode] = activeTool.getInputFieldsWithMime(mimeType)

      /**
       * Switch to batch mode if the tool has batch fields with matching mimeType
       */
      if (isAvailableOnBatchMode) {
        activeTool.setBatchMode(true)
      }

      /**
       * No supported mimes for currently active tool input fields
       */
      if (inputFields.length === 0) {
        setIsChoosingInput(false)
        return
      }

      try {
        if (inputFields.length === 1) {
          const { key: inputFieldKey, component } = inputFields[0]
          const inputComponent = toolComponentService.getInputComponent(component, isBatchModeEnabled)
          const fileContent = await toolComponentService.readFileFromToolComponent(inputComponent, filePath)

          if (fileContent) {
            activeTool.setInputValue(inputFieldKey, fileContent)
            activeTool.resetInputAndOutputFieldsState()
            activeTool.forceRerender()
          }
        }

        if (inputFields.length > 1) {
          setFields(inputFields.map((inputField) => inputField.key))
        }

        setIsChoosingInput(false)
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

  useEffect(() => {
    if (droppedFilePaths.length > 0) {
      void handleFileDrop(droppedFilePaths)
    }
  }, [droppedFilePaths])

  if (!isHovering && !isChoosingInput) {
    return null
  }

  return (
    <div className="FileDropArea">
      <div className="FileDropArea-body">
        {!isChoosingInput && (
          <div className="FileDropArea-text">
            Drop file here
          </div>
        )}

        {isChoosingInput && (
          <Button onClick={handleClickCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
