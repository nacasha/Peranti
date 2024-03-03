import { clsx } from "clsx"
import { type FC, useState } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./SwitchInput.scss"

interface SwitchInputProps extends InputComponentProps {
  options?: Array<{ value: string, label: string }>
}

export const SwitchInput: FC<SwitchInputProps> = (props) => {
  const { label, options = [], onValueChange, defaultValue, readOnly, fieldKey } = props
  const [selectedOption, setSelectedOption] = useState<any>(defaultValue)

  const onClickItem = (option: typeof options[0]) => () => {
    if (readOnly) return
    setSelectedOption(option.value)
    onValueChange(option.value)
  }

  return (
    <div className={clsx("SwitchInput", readOnly && "read-only")} style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      <div className="buttons">
        {options.map((option) => (
          <div
            key={option.value}
            className={clsx("button", selectedOption === option.value && "active")}
            onClick={onClickItem(option)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  )
}
