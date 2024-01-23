import { type FC, type InputHTMLAttributes, useId } from "react"

import { type InputComponentProps } from "src/types/InputComponentProps"

import "./TextInput.scss"

interface TextInputProps extends InputComponentProps {
  autoFocus?: boolean
}

export const TextInput: FC<TextInputProps> = (props) => {
  const id = useId()
  const { onSubmit, defaultValue, readOnly, label, ...restProps } = props

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
        defaultValue={defaultValue}
        onChange={onInputChange}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        {...restProps}
      />
    </div>
  )
}
