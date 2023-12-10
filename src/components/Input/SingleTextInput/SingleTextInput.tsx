import { type FC, useId } from "react"

import "./SingleTextInput.scss"
import { type InputComponentProps } from "src/types/InputComponentProps"

interface SingleTextInputProps extends InputComponentProps { }

export const SingleTextInput: FC<SingleTextInputProps> = (props) => {
  const id = useId()
  const { onSubmit, initialValue, readOnly, label = "Input" } = props

  const onInputChange: React.InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    const value = event.target.value
    onSubmit(value.trim())
  }

  return (
    <div className="SingleTextInput">
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
