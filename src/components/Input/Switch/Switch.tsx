import { type FC, useId, useState } from "react"
import { type InputComponentProps } from "src/types/InputComponentProps"

import "./Switch.scss"

interface SwitchProps extends InputComponentProps {
  options: Array<{ value: string, label: string }>
}

export const Switch: FC<SwitchProps> = (props) => {
  const id = useId()
  const { label, options = [], onSubmit, initialValue, readOnly } = props
  const [selectedOption, setSelectedOption] = useState<any>(initialValue)

  const onClickItem = (option: typeof options[0]) => () => {
    if (readOnly) return
    setSelectedOption(option.value)
    onSubmit(option.value)
  }

  return (
    <div className={"Switch".concat(readOnly ? " read-only" : "")}>
      <label className="InputOutputLabel" htmlFor={id}>
        {label}
      </label>
      <div className="buttons">
        {options.map((option) => (
          <div
            key={option.value}
            className={"button".concat(selectedOption === option.value ? " active" : "")}
            onClick={onClickItem(option)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  )
}
