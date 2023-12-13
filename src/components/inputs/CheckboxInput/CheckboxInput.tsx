import { type FC, useId } from "react"

import { type InputComponentProps } from "src/types/InputComponentProps"

import "./CheckboxInput.scss"

interface CheckboxInputProps extends InputComponentProps<boolean> {}

export const CheckboxInput: FC<CheckboxInputProps> = (props) => {
  const id = useId()
  const { label, onSubmit, readOnly, initialValue } = props

  const onChange: React.InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    onSubmit(event.target.checked)
  }

  return (
    <div className="CheckboxInput">
      <input readOnly={readOnly} id={id} type="checkbox" onChange={onChange} defaultChecked={Boolean(initialValue)} />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}
