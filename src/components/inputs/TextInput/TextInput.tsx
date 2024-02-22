import { type FC, type InputHTMLAttributes, useId } from "react"

import { ComponentLabel } from "src/components/common/ComponentLabel"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./TextInput.scss"

interface TextInputProps extends InputComponentProps {
  autoFocus?: boolean
  type?: string
}

export const TextInput: FC<TextInputProps> = (props) => {
  const id = useId()
  const { onValueChange, defaultValue, readOnly, label, ...restProps } = props

  const onInputChange: InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    const value = event.target.value
    onValueChange(value)
  }

  return (
    <div className="TextInput">
      <ComponentLabel label={label} />
      <input
        id={id}
        defaultValue={defaultValue}
        onChange={onInputChange}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        {...restProps}
        autoComplete="off"
      />
    </div>
  )
}
