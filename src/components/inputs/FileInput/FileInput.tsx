import { useState, type FC, type InputHTMLAttributes, useRef } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./FileInput.scss"

interface InputFileProps extends InputComponentProps<File | null> { }

export const FileInput: FC<InputFileProps> = (props) => {
  const { label, onValueChange, value, fieldKey } = props
  const [selectedFile, setSelectedFile] = useState<File | undefined>(() => value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onChangeFile: InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    const file = event.target.files?.item(0)

    if (file) {
      setSelectedFile(file)
      onValueChange(file)
    }
  }

  const onClickChooseFile = () => {
    fileInputRef?.current?.click()
  }

  return (
    <div className="FileInput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      <div>
        <div onClick={onClickChooseFile} className="FileInputPicker">
          {selectedFile?.name ?? "Click Here to Select File"}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="FileInputInfo"
          max={1}
          onChange={onChangeFile}
          style={{ display: "none" }}
        />
      </div>
    </div>
  )
}
