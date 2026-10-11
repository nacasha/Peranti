import { useState, type FC, type KeyboardEvent, type ReactNode, type RefObject } from "react"

import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { fileDropService } from "src/services/file-drop-service"
import { formatFileSize } from "src/utils/format-file-size"
import { getAcceptLabels } from "src/utils/get-accept-labels"

interface FileInputDropZoneProps {
  fieldKey: string
  title: string
  inputRef: RefObject<HTMLInputElement>
  onSelectFiles: (files: File[]) => void
  accept?: string
  maxSize?: number
  multiple?: boolean

  /**
   * Shown in place of the prompt, e.g. the selected file, which then still
   * takes drops to replace it
   */
  children?: ReactNode
}

/**
 * Dashed drop target with the hidden file picker. Browser drags land here
 * directly; Tauri drags arrive through the file drop service, so the hovered
 * zone from there lights it up the same way.
 */
export const FileInputDropZone: FC<FileInputDropZoneProps> = (props) => {
  const { fieldKey, title, inputRef, onSelectFiles, accept, maxSize, multiple, children } = props
  const [isDragging, setIsDragging] = useState(false)

  const isHovered = useSelector(() => {
    const zone = fileDropService.hoveredZone
    return zone?.type === "field" && zone.id === fieldKey
  })

  const acceptLabels = accept ? getAcceptLabels(accept) : []
  const sizeLabel = maxSize === undefined
    ? "Drag and drop, or"
    : `Up to ${formatFileSize(maxSize)}${multiple ? " each" : ""} · or`

  const selectFiles = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? [])
      .filter((file) => maxSize === undefined || file.size <= maxSize)

    if (files.length > 0) {
      onSelectFiles(multiple ? files : files.slice(0, 1))
    }
  }

  const openPicker = () => {
    inputRef.current?.click()
  }

  // With children the zone only takes drops; its content brings its own actions
  const pickerProps = children === undefined
    ? {
      role: "button",
      tabIndex: 0,
      onClick: openPicker,
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          openPicker()
        }
      }
    }
    : {}

  return (
    <div
      className="FileInput-dropzone"
      data-filled={children !== undefined || undefined}
      data-dragging={isDragging || isHovered || undefined}
      {...pickerProps}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(event) => {
        // Moving over a child fires a leave on the parent too
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDragging(false)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        selectFiles(event.dataTransfer.files)
      }}
    >
      {children ?? (
        <>
          <span className="FileInput-dropzone-icon">
            <Icons.Upload size={15} aria-hidden />
          </span>

          <span className="FileInput-dropzone-text">
            <span className="FileInput-dropzone-title">{title}</span>
            <span className="FileInput-dropzone-caption">
              {sizeLabel} <span className="FileInput-dropzone-browse">browse</span>
            </span>
          </span>

          {acceptLabels.length > 0 && (
            <span className="FileInput-dropzone-types">
              {acceptLabels.map((acceptLabel) => (
                <span key={acceptLabel} className="FileInput-dropzone-type">{acceptLabel}</span>
              ))}
            </span>
          )}
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        hidden
        onClick={(event) => { event.stopPropagation() }}
        onChange={(event) => {
          selectFiles(event.target.files)

          // Allow picking the same file again after it was removed
          event.target.value = ""
        }}
      />
    </div>
  )
}
