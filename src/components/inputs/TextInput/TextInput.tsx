import { type FC, type InputHTMLAttributes, useId } from "react"

import { type InputComponentProps } from "src/types/InputComponentProps"

import "./TextInput.scss"

interface TextInputProps extends InputComponentProps { }

export const TextInput: FC<TextInputProps> = (props) => {
  const id = useId()
  const { onSubmit, initialValue, readOnly, label } = props

  const onInputChange: InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    const value = event.target.value
    onSubmit(value.trim())
  }

  return (
    <div className="TextInput">
      <label className="InputOutputLabel" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        defaultValue={initialValue}
        onChange={onInputChange}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
      />
    </div>
  )
}
