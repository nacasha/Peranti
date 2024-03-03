import React, { type JSX, useId } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./SelectInput.scss"

interface Option<T = any> {
  label: string
  value: T
}

interface SelectInputProps<T extends string> extends InputComponentProps<T> {
  options?: Array<Option<T>>
}

export const SelectInput: <T extends string>(props: SelectInputProps<T>) => JSX.Element = (props) => {
  const id = useId()
  const { label, options = [], onValueChange, readOnly, defaultValue, fieldKey } = props

  const onChange: React.SelectHTMLAttributes<HTMLSelectElement>["onChange"] = function(event) {
    onValueChange(event.target.value as any)
  }

  return (
    <div className="SelectInput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      <select
        id={id}
        disabled={readOnly}
        onChange={onChange}
        defaultValue={defaultValue}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
