import mime from "mime"
import { useEffect, type FC, useState } from "react"

import { Button } from "src/components/common/Button"
import { useSelector } from "src/hooks/useSelector"
import { FileService } from "src/services/fileService"
import { toolComponentService } from "src/services/toolComponentService"
import { windowManager } from "src/services/windowManager"
import { fileDropStore } from "src/stores/fileDropStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { convertCRLFtoLF } from "src/utils/convertCRLFtoLF"

import "./FileDropArea.scss"

const getFile = async(filePath: string, type: string) => {
  if (type === "text") {
    const fileContent = await FileService.readFileAsText(filePath)
    return convertCRLFtoLF(fileContent)
  } else if (type === "file") {
    const file = await FileService.readFileAsBinary(filePath)
    return createFileFromUint32Array(file, filePath.replace(/^.*[\\/]/, ""))
  }
}

function createFileFromUint32Array(uint32Array: Uint8Array, fileName: string) {
  // Convert Uint32Array to Uint8Array
  const uint8Array = new Uint8Array(uint32Array.buffer)

  // Create a Blob from the Uint8Array
  const blob = new Blob([uint8Array], { type: mime.getType(fileName) ?? "application/octet-stream" })

  // Create a File from the Blob
  const file = new File([blob], fileName, { type: mime.getType(fileName) ?? "application/octet-stream" })

  return file
}

export const FileDropArea: FC = () => {
  const [isChoosingInput, setIsChoosingInput] = useState(false)
  const [, setFields] = useState<string[]>([])

  const isHovering = useSelector(() => fileDropStore.isHovering)
  const droppedFilePaths = useSelector(() => fileDropStore.droppedFilePaths)
  const activeTool = useSelector(() => toolRunnerStore.getActiveTool())

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
          const componentReadFileAs = toolComponentService.getInputComponent(
            component,
            activeTool.isBatchModeEnabled
          ).readFileAs

          if (componentReadFileAs) {
            const fileContent = await getFile(filePath, componentReadFileAs)

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
