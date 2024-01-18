import { type FC, type InputHTMLAttributes } from "react"

import { type InputComponentProps } from "src/types/InputComponentProps"

interface InputFileProps extends InputComponentProps<FileList | null> { }

export const FileInput: FC<InputFileProps> = (props) => {
  const { onSubmit, defaultValue, label, readOnly } = props

  const onChangeFile: InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    const files = event.target.files
    onSubmit(files)
  }

  return (
    <input type="file" onChange={onChangeFile} />
  )
}
