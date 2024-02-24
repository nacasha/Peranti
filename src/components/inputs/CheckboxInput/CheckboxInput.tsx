import { type FC } from "react"

import { Checkbox } from "src/components/common/Checkbox"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./CheckboxInput.scss"

interface CheckboxInputProps extends InputComponentProps<boolean> {}

export const CheckboxInput: FC<CheckboxInputProps> = (props) => {
  const { label, onValueChange, readOnly, defaultValue, fieldKey } = props

  const onChange = (checked: boolean) => {
    onValueChange(checked)
  }

  return (
    <div className="CheckboxInput" style={{ gridArea: fieldKey }}>
      <Checkbox
        defaultChecked={Boolean(defaultValue)}
        onChange={onChange}
        readOnly={readOnly}
        label={label}
      />
    </div>
  )
}
