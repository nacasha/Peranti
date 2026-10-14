import { useId, type FC, useState } from "react"

import "./Checkbox.scss"

interface CheckboxProps {
  label?: string
  defaultChecked?: boolean
  value?: boolean
  onChange?: (checked: boolean) => any
  readOnly?: boolean
  disabled?: boolean
}

export const Checkbox: FC<CheckboxProps> = (props) => {
  const { label, onChange: onChangeProps, defaultChecked = false, readOnly, value, disabled } = props
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
    <div className="Switch">
      <input
        checked={value ?? checked}
        id={id}
        type="checkbox"
        onChange={onChange}
        readOnly={readOnly}
        disabled={disabled}
      />
      {label && <label htmlFor={id}>{label}</label>}
    </div>
  )
}
