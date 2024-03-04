import { type FC } from "react"

import { Checkbox } from "src/components/common/Checkbox"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./CheckboxInput.scss"

interface CheckboxInputProps extends InputComponentProps<boolean> {}

export const CheckboxInput: FC<CheckboxInputProps> = (props) => {
  const { label, onValueChange, readOnly, value, fieldKey } = props

  const onChange = (checked: boolean) => {
    onValueChange(checked)
  }

  return (
    <div className="CheckboxInput" style={{ gridArea: fieldKey }}>
      <Checkbox
        value={Boolean(value)}
        onChange={onChange}
        readOnly={readOnly}
        label={label}
      />
    </div>
  )
}
