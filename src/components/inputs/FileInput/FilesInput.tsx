import { type FC, type InputHTMLAttributes, useRef } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./FileInput.scss"

interface InputFilesProps extends InputComponentProps<File[]> {
  /**
   * Comma separated list of accepted file types, e.g. ".json,.txt"
   */
  accept?: string
}

export const FilesInput: FC<InputFilesProps> = (props) => {
  const { label, onValueChange, value, fieldKey, accept } = props
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Values restored from a saved session are no longer File instances
  const selectedFiles: File[] = Array.isArray(value)
    ? value.filter((file): file is File => file instanceof File)
    : []

  const onChangeFiles: InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length > 0) {
      onValueChange([...selectedFiles, ...files])
    }

    // Allow picking the same file again after it was removed
    event.target.value = ""
  }

  const onClickChooseFiles = () => {
    fileInputRef?.current?.click()
  }

  const onClickRemoveFile = (index: number) => {
    onValueChange(selectedFiles.filter((_, fileIndex) => fileIndex !== index))
  }

  const onClickClear = () => {
    onValueChange([])
  }

  return (
    <div className="FileInput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      <div>
        <div onClick={onClickChooseFiles} className="FileInputPicker">
          {selectedFiles.length > 0
            ? `${selectedFiles.length} file(s) selected, click here to add more`
            : "Click Here to Select Files"}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={onChangeFiles}
          style={{ display: "none" }}
        />
        {selectedFiles.length > 0 && (
          <div className="FileInputList">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="FileInputListItem">
                <span className="FileInputListItemName">{file.name}</span>
                <button type="button" onClick={() => { onClickRemoveFile(index) }}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="FileInputListClear" onClick={onClickClear}>
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
