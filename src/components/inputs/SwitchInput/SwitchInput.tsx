import { clsx } from "clsx"
import { type FC, useState } from "react"

import { ComponentLabel } from "src/components/common/ComponentLabel"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./SwitchInput.scss"

interface SwitchInputProps extends InputComponentProps {
  options?: Array<{ value: string, label: string }>
}

export const SwitchInput: FC<SwitchInputProps> = (props) => {
  const { label, options = [], onSubmit, defaultValue, readOnly } = props
  const [selectedOption, setSelectedOption] = useState<any>(defaultValue)

  const onClickItem = (option: typeof options[0]) => () => {
    if (readOnly) return
    setSelectedOption(option.value)
    onSubmit(option.value)
  }

  return (
    <div className={clsx("SwitchInput", readOnly && "read-only")}>
      <ComponentLabel label={label} />
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
