import { type FC, useId } from "react"

import { Switch } from "src/components/common/Switch"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./CheckboxInput.scss"

interface CheckboxInputProps extends InputComponentProps<boolean> {}

export const CheckboxInput: FC<CheckboxInputProps> = (props) => {
  const id = useId()
  const { label, onSubmit, readOnly, defaultValue } = props

  const onChange = (checked: boolean) => {
    onSubmit(checked)
  }

  return (
    <div className="CheckboxInput">
      <label htmlFor={id}>{label}</label>
      <Switch defaultChecked={Boolean(defaultValue)} onChange={onChange} readOnly={readOnly} />
    </div>
  )
}
