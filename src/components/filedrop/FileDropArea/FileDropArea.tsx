import { useEffect, type FC, useState } from "react"
import SimpleBar from "simplebar-react"

import { FileDropToolPicker } from "src/components/filedrop/FileDropToolPicker"
import { Icons } from "src/constants/icons"
import { FileDropAction } from "src/enums/file-drop-action"
import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletFileSupportService } from "src/services/applet-file-support-service"
import { fileDropService, type DroppedFileInfo } from "src/services/file-drop-service"
import { hotkeysStore } from "src/services/hotkeys-store"
import { windowManager } from "src/services/window-manager"
import { formatFileSize } from "src/utils/file/format-file-size"

import "./FileDropArea.scss"

interface FileRowProps {
  file: DroppedFileInfo
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}

const FileRow: FC<FileRowProps> = ({ file, isSelected, onSelect, onRemove }) => {
  const label = file.isDirectory ? "DIR" : (file.extension || "FILE")

  const meta = [
    file.isDirectory ? "Folder" : label.toUpperCase(),
    file.size === undefined ? undefined : formatFileSize(file.size)
  ].filter(Boolean)

  return (
    <li className="FileDropArea-file" data-selected={isSelected || undefined} title={file.path}>
      <button type="button" className="FileDropArea-file-main" onClick={onSelect}>
        <Icons.File size={16} aria-hidden className="FileDropArea-file-icon" />

        <span className="FileDropArea-file-name">{file.name}</span>
        <span className="FileDropArea-file-meta">{meta.join(" · ")}</span>
      </button>

      <button
        type="button"
        className="FileDropArea-file-remove"
        aria-label={`Remove ${file.name}`}
        title="Remove"
        onClick={onRemove}
      >
        <Icons.Close size={12} aria-hidden />
      </button>
    </li>
  )
}

export const FileDropArea: FC = () => {
  const [isChooshingAction, setIsChoosingAction] = useState(false)
  const [isFileListOpen, setIsFileListOpen] = useState(true)
  const [selectedPath, setSelectedPath] = useState<string>()
  const [isAllFiles, setIsAllFiles] = useState(false)

  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())
  const isHoveringFile = useSelector(() => fileDropService.isHoveringFile)
  const isDroppingFile = useSelector(() => fileDropService.isDroppingFile)
  const droppedFilePaths = useSelector(() => fileDropService.droppedFilePaths)
  const droppedFileDetails = useSelector(() => fileDropService.droppedFileDetails)
  const fileDropAction = useSelector(() => fileDropService.fileDropAction)
  const hoveredZone = useSelector(() => fileDropService.hoveredZone)

  const handleFileDrop = async(filePaths: string[]) => {
    if (filePaths.length === 0) {
      return
    }

    void windowManager.setFocus()

    // Landing on a glowing input is already a decision, so it asks nothing.
    // Only a drop on empty space falls back to the configured action.
    if (hoveredZone?.type === "field") {
      setIsChoosingAction(false)
      await fileDropService.dropOnField(hoveredZone.id)
    } else if (fileDropAction === FileDropAction.AlwaysAsk) {
      setIsChoosingAction(true)
    } else {
      setIsChoosingAction(false)
      await fileDropService.proceedFileDropBasedOnAction()
    }
  }

  const handleClickCancel = () => {
    setIsChoosingAction(false)
    fileDropService.resetState()
  }

  const handleSelectApplet = (appletId: string) => {
    if (!selectedFile) {
      return
    }

    // Unless "use for all" is on, only the selected file goes to the tool and
    // the rest stay listed so each can go to a different one. The panel closes
    // itself once the list is empty.
    const filePaths = useAllFiles ? droppedFileDetails.map((file) => file.path) : [selectedFile.path]

    void fileDropService.openInNewSessionOfApplet(appletId, filePaths).then(() => {
      if (fileDropService.droppedFilePaths.length === 0) {
        setIsChoosingAction(false)
      }
    })
  }

  useEffect(() => {
    // Removing a file from the list changes the paths too, which must not
    // re-run the drop that already put the panel in choose mode
    if (isDroppingFile && droppedFilePaths.length > 0 && !isChooshingAction) {
      void handleFileDrop(droppedFilePaths)
    }
  }, [droppedFilePaths, isDroppingFile])

  // Removing the last file leaves nothing to choose a tool for
  useEffect(() => {
    if (isChooshingAction && droppedFilePaths.length === 0) {
      setIsChoosingAction(false)
    }
  }, [isChooshingAction, droppedFilePaths])

  useHotkeysModified(hotkeysStore.keys.ESCAPE, () => {
    handleClickCancel()
  }, { enabled: isChooshingAction })

  if (!isHoveringFile && !isChooshingAction) {
    return null
  }

  const fileCount = droppedFilePaths.length
  const hasMultipleFiles = fileCount > 1
  const fileLabel = `${fileCount} file${hasMultipleFiles ? "s" : ""}`

  const totalSize = droppedFileDetails.reduce(
    (total, file) => total + (file.size ?? 0),
    0
  )
  const hasKnownSize = droppedFileDetails.some((file) => file.size !== undefined)

  // Tools are ranked for one file at a time: the selected one, which is also
  // the file the picked tool opens
  const selectedFile = droppedFileDetails.find((file) => file.path === selectedPath) ?? droppedFileDetails[0]
  const hasSeveralFiles = droppedFileDetails.length > 1
  const useAllFiles = isAllFiles && hasSeveralFiles
  const rankedTargets = appletFileSupportService.getRankedFileTargets(
    useAllFiles
      ? droppedFileDetails.map((file) => file.extension)
      : (selectedFile ? [selectedFile.extension] : []),
    activeApplet.appletId
  )
  const canFillActiveApplet = rankedTargets.some((target) => target.isActiveApplet)

  return (
    <div className="FileDropArea" data-mode={isChooshingAction ? "choose" : "hover"}>
      {isChooshingAction
        ? (
          <>
            <div className="FileDropArea-header">
              <div className="FileDropArea-title">{fileLabel} dropped</div>

              <div className="FileDropArea-header-buttons">
                <button
                  type="button"
                  className="FileDropArea-iconButton"
                  aria-label={isFileListOpen ? "Hide files" : "Show files"}
                  title={isFileListOpen ? "Hide files" : "Show files"}
                  onClick={() => { setIsFileListOpen((isOpen) => !isOpen) }}
                >
                  {isFileListOpen
                    ? <Icons.ChevronDown size={16} aria-hidden />
                    : <Icons.ChevronUp size={16} aria-hidden />}
                </button>
                <button
                  type="button"
                  className="FileDropArea-iconButton"
                  aria-label="Close"
                  title="Close (Esc)"
                  onClick={handleClickCancel}
                >
                  <Icons.Close size={16} aria-hidden />
                </button>
              </div>
            </div>

            {isFileListOpen && (
              <SimpleBar className="FileDropArea-files">
                <ul className="FileDropArea-files-list">
                  {droppedFileDetails.map((file) => (
                    <FileRow
                      key={file.path}
                      file={file}
                      isSelected={file.path === selectedFile?.path}
                      onSelect={() => { setSelectedPath(file.path) }}
                      onRemove={() => { fileDropService.removeDroppedFiles([file.path]) }}
                    />
                  ))}
                </ul>
              </SimpleBar>
            )}

            {selectedFile && (
              <div className="FileDropArea-picker">
                <FileDropToolPicker
                  targets={rankedTargets}
                  subject={useAllFiles ? `${droppedFileDetails.length} files` : selectedFile.name}
                  allFilesCount={droppedFileDetails.length}
                  isAllFiles={useAllFiles}
                  onToggleAllFiles={() => { setIsAllFiles((value) => !value) }}
                  onSelect={handleSelectApplet}
                />
              </div>
            )}
          </>
        )
        : (
          <div className="FileDropArea-header">
            <div className="FileDropArea-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path
                  d="M14 3v4a1 1 0 0 0 1 1h4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 8.5V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6.5L19 8.5Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M12 11v6m0 0 2.5-2.5M12 17l-2.5-2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {hasMultipleFiles && (
                <span className="FileDropArea-icon-count">{fileCount}</span>
              )}
            </div>

            <div className="FileDropArea-heading">
              <div className="FileDropArea-title">
                {canFillActiveApplet ? "Drop on an input or anywhere" : "Drop anywhere"}
              </div>
              <div className="FileDropArea-subtitle">
                {fileLabel}{hasKnownSize && ` · ${formatFileSize(totalSize)}`}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
