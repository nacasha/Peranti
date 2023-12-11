import { type FC, useId } from "react"

import "./SingleTextareaInput.scss"
import { type InputComponentProps } from "src/types/InputComponentProps"

interface SingleTextareaInputProps extends InputComponentProps {}

export const SingleTextareaInput: FC<SingleTextareaInputProps> = (props) => {
  const id = useId()
  const { onSubmit, initialValue, readOnly, label = "Input" } = props

  const onInputChange: React.InputHTMLAttributes<HTMLTextAreaElement>["onBlur"] = (event) => {
    const value = event.target.value
    onSubmit(value.trim())
  }

  return (
    <div className="SingleTextareaInput">
      <label className="InputOutputLabel" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        defaultValue={initialValue}
        onChange={onInputChange}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        rows={5}
      />
    </div>
  )
}
