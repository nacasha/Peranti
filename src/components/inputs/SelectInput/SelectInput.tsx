import { type FC, useId } from "react"

import { type InputComponentProps } from "src/types/InputComponentProps"

import "./SelectInput.scss"

interface SelectInputProps extends InputComponentProps {
  options: Array<{ value: string, label: string }>
}

export const SelectInput: FC<SelectInputProps> = (props) => {
  const id = useId()
  const { label, options = [], onSubmit, readOnly, initialValue } = props

  const onChange: React.SelectHTMLAttributes<HTMLSelectElement>["onChange"] = (event) => {
    onSubmit(event.target.value)
  }

  return (
    <div className="SelectInput">
      {label && (
        <label className="InputOutputLabel" htmlFor={id}>
          {label}
        </label>
      )}
      <select disabled={readOnly} id={id} onChange={onChange} defaultValue={initialValue}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )
}
