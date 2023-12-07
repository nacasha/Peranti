import { type FC, useId } from "react"

import "./CheckboxInput.scss"
import { type InputComponentProps } from "src/types/InputComponentProps"

interface CheckboxInputProps extends InputComponentProps<boolean> {}

export const CheckboxInput: FC<CheckboxInputProps> = (props) => {
  const id = useId()
  const { label, onSubmit, initialValue } = props

  const onChange: React.InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    onSubmit(event.target.checked)
  }

  return (
    <div className="CheckboxInput">
      <input id={id} type="checkbox" onChange={onChange} defaultChecked={Boolean(initialValue)} />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}
