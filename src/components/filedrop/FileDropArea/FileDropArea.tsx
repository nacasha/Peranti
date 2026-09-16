import { useEffect, type CSSProperties, type FC, useState } from "react"

import { FileDropToolPicker } from "src/components/filedrop/FileDropToolPicker"
import { FileDropAction } from "src/enums/file-drop-action"
import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletFileSupportService } from "src/services/applet-file-support-service"
import { fileDropService, type DroppedFileInfo } from "src/services/file-drop-service"
import { hotkeysStore } from "src/services/hotkeys-store"
import { windowManager } from "src/services/window-manager"
import { formatFileSize } from "src/utils/format-file-size"
import { getExtensionHue } from "src/utils/get-extension-hue"
import { shortenDirectoryPath } from "src/utils/shorten-directory-path"

import "./FileDropArea.scss"

/** Files listed individually before the list collapses into a "+N more" row. */
const MAX_VISIBLE_FILES = 4

const FileRow: FC<{ file: DroppedFileInfo }> = ({ file }) => {
  const label = file.isDirectory ? "DIR" : (file.extension || "FILE")
  const hue = getExtensionHue(label)

  // The hue is handed to CSS as a custom property so the tint logic stays in the
  // stylesheet, where the light/dark variants of it live.
  const badgeStyle: CSSProperties = { ["--badge-hue" as string]: hue }

  const meta = [
    file.isDirectory ? "Folder" : undefined,
    file.size === undefined ? undefined : formatFileSize(file.size),
    file.directory ? shortenDirectoryPath(file.directory) : undefined
  ].filter(Boolean)

  return (
    <li className="FileDropArea-file" title={file.path}>
      <span
        className="FileDropArea-file-badge"
        style={badgeStyle}
      >
        {label.slice(0, 4)}
      </span>

      <span className="FileDropArea-file-info">
        <span className="FileDropArea-file-name">{file.name}</span>
        <span className="FileDropArea-file-meta">
          {meta.map((part, index) => (
            <span key={index} className="FileDropArea-file-meta-part">{part}</span>
          ))}
        </span>
      </span>
    </li>
  )
}

export const FileDropArea: FC = () => {
  const [isChooshingAction, setIsChoosingAction] = useState(false)

  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())
  const isHoveringFile = useSelector(() => fileDropService.isHoveringFile)
  const isDroppingFile = useSelector(() => fileDropService.isDroppingFile)
  const droppedFilePaths = useSelector(() => fileDropService.droppedFilePaths)
  const droppedFileDetails = useSelector(() => fileDropService.droppedFileDetails)
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

  const handleSelectApplet = (appletId: string) => {
    setIsChoosingAction(false)
    void fileDropService.openInNewSessionOfApplet(appletId)
  }

  useEffect(() => {
    if (isDroppingFile && droppedFilePaths.length > 0) {
      void handleFileDrop(droppedFilePaths)
    }
  }, [droppedFilePaths, isDroppingFile])

  useHotkeysModified(hotkeysStore.keys.ESCAPE, () => {
    handleClickCancel()
  }, { enabled: isChooshingAction })

  if (!isHoveringFile && !isChooshingAction) {
    return null
  }

  const activeAppletName = activeApplet.name
  const fileCount = droppedFilePaths.length
  const hasMultipleFiles = fileCount > 1
  const fileLabel = `${fileCount} file${hasMultipleFiles ? "s" : ""}`

  const visibleFiles = droppedFileDetails.slice(0, MAX_VISIBLE_FILES)
  const hiddenFileCount = droppedFileDetails.length - visibleFiles.length

  const totalSize = droppedFileDetails.reduce(
    (total, file) => total + (file.size ?? 0),
    0
  )
  const hasKnownSize = droppedFileDetails.some((file) => file.size !== undefined)

  const droppedExtensions = droppedFileDetails.map((file) => file.extension)
  const rankedTargets = isChooshingAction
    ? appletFileSupportService.getRankedFileTargets(droppedExtensions, activeApplet.appletId)
    : []
  const canReplaceActiveApplet = rankedTargets.some((target) => target.isActiveApplet)

  return (
    <div className="FileDropArea" data-mode={isChooshingAction ? "choose" : "hover"}>
      <div className="FileDropArea-card">
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
              {isChooshingAction ? `What should we do with ${fileLabel}?` : "Drop to open"}
            </div>
            <div className="FileDropArea-subtitle">
              {isChooshingAction
                ? <>Destination tool <strong>{activeAppletName}</strong></>
                : <>{fileLabel}{hasKnownSize && ` · ${formatFileSize(totalSize)}`} → <strong>{activeAppletName}</strong></>}
            </div>
          </div>
        </div>

        {visibleFiles.length > 0 && (
          <ul className="FileDropArea-files">
            {visibleFiles.map((file) => (
              <FileRow key={file.path} file={file} />
            ))}
            {hiddenFileCount > 0 && (
              <li className="FileDropArea-file FileDropArea-file--more">
                +{hiddenFileCount} more file{hiddenFileCount > 1 && "s"}
              </li>
            )}
          </ul>
        )}

        {isChooshingAction && (
          <div className="FileDropArea-actions">
            {canReplaceActiveApplet && (hasMultipleFiles
              ? (
                <button
                  type="button"
                  className="FileDropArea-action"
                  onClick={handleReplaceCurrentSessionAndOpen}
                >
                  <span className="FileDropArea-action-title">
                    Replace current <strong>{activeAppletName}</strong>
                  </span>
                  <span className="FileDropArea-action-description">
                    First file replaces this editor, the other {fileCount - 1} open in new editors
                  </span>
                </button>
              )
              : (
                <button
                  type="button"
                  className="FileDropArea-action"
                  onClick={handleReplaceCurrentSession}
                >
                  <span className="FileDropArea-action-title">
                    Replace current <strong>{activeAppletName}</strong>
                  </span>
                  <span className="FileDropArea-action-description">
                    Overwrites the input of the editor you are looking at
                  </span>
                </button>
              ))}

            <FileDropToolPicker
              targets={rankedTargets}
              hint={`opens ${fileCount} new editor${hasMultipleFiles ? "s" : ""}`}
              onSelect={handleSelectApplet}
            />

            <button
              type="button"
              className="FileDropArea-cancel"
              onClick={handleClickCancel}
            >
              Cancel <kbd>Esc</kbd>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
