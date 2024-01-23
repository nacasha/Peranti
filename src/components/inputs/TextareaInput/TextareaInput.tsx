import { type FC, useId } from "react"

import { type InputComponentProps } from "src/types/InputComponentProps"

import "./TextAreaInput.scss"

interface TextAreaInputProps extends InputComponentProps {
  autoFocus?: boolean
}

export const TextAreaInput: FC<TextAreaInputProps> = (props) => {
  const id = useId()
  const { onSubmit, defaultValue, readOnly, label = "Input", ...restProps } = props

  const onInputChange: React.InputHTMLAttributes<HTMLTextAreaElement>["onBlur"] = (event) => {
    const value = event.target.value
    onSubmit(value.trim())
  }

  return (
    <div className="TextAreaInput">
      <label className="InputOutputLabel" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        defaultValue={defaultValue}
        onChange={onInputChange}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        rows={5}
        {...restProps}
      />
    </div>
  )
}
