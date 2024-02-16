import clsx from "clsx"
import { useId, type FC, useState } from "react"

import { switchClasses } from "./Switch.css"

import "./Switch.scss"

interface SwitchProps {
  label?: string
  defaultChecked?: boolean
  value?: boolean
  onChange?: (checked: boolean) => any
  readOnly?: boolean
}

export const Switch: FC<SwitchProps> = (props) => {
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
    <div className={clsx("Switch", switchClasses.root)}>
      <input
        checked={value ?? checked}
        id={id}
        type="checkbox"
        className="switch"
        onChange={onChange}
        readOnly={readOnly}
      />
      {label && <label htmlFor={id}>Switch</label>}
    </div>
  )
}
