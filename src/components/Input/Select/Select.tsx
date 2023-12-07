import { type FC, useId } from "react"
import { type BaseInputComponentProps } from "src/types/BaseInputComponentProps"

import "./Select.scss"

interface SelectProps extends BaseInputComponentProps {
  options: Array<{ value: string, label: string }>
}

export const Select: FC<SelectProps> = (props) => {
  const id = useId()
  const { label, options = [], onSubmit, initialValue } = props

  const onChange: React.SelectHTMLAttributes<HTMLSelectElement>["onChange"] = (event) => {
    onSubmit(event.target.value)
  }

  return (
    <div className="Select">
      <label className="InputOutputLabel" htmlFor={id}>
        {label}
      </label>
      <select id={id} onChange={onChange} defaultValue={initialValue}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )
}
