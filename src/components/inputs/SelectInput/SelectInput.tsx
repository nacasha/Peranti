import { type JSX } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { Dropdown } from "src/components/common/Dropdown"
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
  const { label, options = [], onValueChange, readOnly, value, fieldKey } = props

  const onChange = (value: any) => {
    onValueChange(value)
  }

  return (
    <div className="SelectInput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      <Dropdown
        width="100%"
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        options={options}
      />
    </div>
  )
}
