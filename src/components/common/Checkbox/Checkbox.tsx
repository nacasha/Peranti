import clsx from "clsx"
import { useId, type FC, useState } from "react"

import { checkboxClasses } from "./Checkbox.css"

import "./Checkbox.scss"

interface CheckboxProps {
  label?: string
  defaultChecked?: boolean
  value?: boolean
  onChange?: (checked: boolean) => any
  readOnly?: boolean
}

export const Checkbox: FC<CheckboxProps> = (props) => {
  const { label, onChange: onChangeProps, defaultChecked = false, readOnly, value } = props
  const [checked, setChecked] = useState(defaultChecked)
  const id = useId()

  const onChange: React.InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    const checked = event.target.checked
    setChecked(checked)
    if (onChangeProps) {
      onChangeProps(checked)
    }
  }

  return (
    <div className={clsx("Switch", checkboxClasses.root)}>
      <input
        checked={value ?? checked}
        id={id}
        type="checkbox"
        onChange={onChange}
        readOnly={readOnly}
      />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  )
}
