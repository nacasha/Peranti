import { type FC, useId } from "react"

import "./SingleTextInput.scss"
import { type BaseInputComponentProps } from "src/types/BaseInputComponentProps"

interface SingleTextInputProps extends BaseInputComponentProps { }

export const SingleTextInput: FC<SingleTextInputProps> = (props) => {
  const id = useId()
  const { onSubmit, initialValue, label = "Input" } = props

  const onInputBlur: React.DOMAttributes<HTMLInputElement>["onBlur"] = (event) => {
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
        onBlur={onInputBlur}
        defaultValue={initialValue}
      />
    </div>
  )
}
