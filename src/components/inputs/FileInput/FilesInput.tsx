import { useRef, type FC } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type InputComponentProps } from "src/types/InputComponentProps"
import { formatFileSize } from "src/utils/format-file-size"

import { FileInputDropZone } from "./FileInputDropZone.tsx"
import { FileInputItem } from "./FileInputItem.tsx"

import "./FileInput.scss"

interface InputFilesProps extends InputComponentProps<File[]> {
  /**
   * Comma separated list of accepted file types, e.g. ".json,.txt"
   */
  accept?: string

  /**
   * Largest accepted size per file in bytes, bigger files are ignored
   */
  maxSize?: number
}

export const FilesInput: FC<InputFilesProps> = (props) => {
  const { label, onValueChange, value, fieldKey, accept, maxSize } = props
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Values restored from a saved session are no longer File instances
  const selectedFiles: File[] = Array.isArray(value)
    ? value.filter((file): file is File => file instanceof File)
    : []

  const totalSize = selectedFiles.reduce((total, file) => total + file.size, 0)

  const onClickRemoveFile = (index: number) => {
    onValueChange(selectedFiles.filter((_, fileIndex) => fileIndex !== index))
  }

  return (
    <div className="FileInput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      <div className="FileInput-body">
        <FileInputDropZone
          fieldKey={fieldKey}
          title="Drop files"
          inputRef={fileInputRef}
          accept={accept}
          maxSize={maxSize}
          multiple
          onSelectFiles={(files) => { onValueChange([...selectedFiles, ...files]) }}
        />

        {selectedFiles.length > 0 && (
          <>
            <ul className="FileInput-list">
              {selectedFiles.map((file, index) => (
                <FileInputItem
                  key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                  file={file}
                  onRemove={() => { onClickRemoveFile(index) }}
                />
              ))}
            </ul>

            <div className="FileInput-footer">
              <span>
                {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} · {formatFileSize(totalSize)}
              </span>
              <button type="button" className="FileInput-clear" onClick={() => { onValueChange([]) }}>
                Clear all
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
