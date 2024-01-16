import React, { type JSX, useId } from "react"

import { type InputComponentProps } from "src/types/InputComponentProps"

import "./SelectInput.scss"

interface SelectInputProps<T extends string> extends InputComponentProps<T> {
  options: Array<{ value: T, label: string }>
}

export const SelectInput: <T extends string>(props: SelectInputProps<T>) => JSX.Element = (props) => {
  const id = useId()
  const { label, options = [], onSubmit, readOnly, defaultValue } = props

  const onChange: React.SelectHTMLAttributes<HTMLSelectElement>["onChange"] = function(event) {
    onSubmit(event.target.value as any)
  }

  return (
    <div className="SelectInput">
      <label className="InputOutputLabel" htmlFor={id}>
        {label}
      </label>
      <select disabled={readOnly} id={id} onChange={onChange} defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )
}
