import { useRef, type FC } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type InputComponentProps } from "src/types/InputComponentProps"

import { FileInputDropZone } from "./FileInputDropZone.tsx"
import { FileInputItem } from "./FileInputItem.tsx"

import "./FileInput.scss"

interface InputFileProps extends InputComponentProps<File | null> {
  /**
   * Comma separated list of accepted file types, e.g. ".json,.txt"
   */
  accept?: string

  /**
   * Largest accepted file in bytes, bigger files are ignored
   */
  maxSize?: number
}

export const FileInput: FC<InputFileProps> = (props) => {
  const { label, onValueChange, value, fieldKey, accept, maxSize } = props
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Values restored from a saved session are no longer File instances
  const selectedFile = value instanceof File ? value : undefined

  return (
    <div className="FileInput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      <div className="FileInput-body">
        <FileInputDropZone
          fieldKey={fieldKey}
          title="Drop a file"
          inputRef={fileInputRef}
          accept={accept}
          maxSize={maxSize}
          onSelectFiles={([file]) => { onValueChange(file) }}
        >
          {selectedFile && (
            <ul className="FileInput-list">
              <FileInputItem
                key={`${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified}`}
                file={selectedFile}
                onReplace={() => { fileInputRef.current?.click() }}
                onRemove={() => { onValueChange(null) }}
              />
            </ul>
          )}
        </FileInputDropZone>
      </div>
    </div>
  )
}
