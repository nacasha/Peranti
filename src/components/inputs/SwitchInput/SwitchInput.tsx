import { clsx } from "clsx"
import { type FC, useId, useState, memo } from "react"

import { type InputComponentProps } from "src/types/InputComponentProps"

import "./SwitchInput.scss"

interface SwitchInputProps extends InputComponentProps {
  options: Array<{ value: string, label: string }>
}

export const SwitchInput: FC<SwitchInputProps> = memo((props) => {
  const id = useId()
  const { label, options = [], onSubmit, defaultValue, readOnly } = props
  const [selectedOption, setSelectedOption] = useState<any>(defaultValue)

  const onClickItem = (option: typeof options[0]) => () => {
    if (readOnly) return
    setSelectedOption(option.value)
    onSubmit(option.value)
  }

  console.log("render, label")

  return (
    <div className={clsx("SwitchInput", readOnly && "read-only")}>
      <label className="InputOutputLabel" htmlFor={id}>
        {label}
      </label>
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
}, (prevProps, nextProps) => {
  console.log({ prevProps, nextProps })

  return prevProps.label !== nextProps.label ||
  prevProps.readOnly !== nextProps.readOnly
})
