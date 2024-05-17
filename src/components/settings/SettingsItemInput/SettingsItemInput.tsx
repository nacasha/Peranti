import { type ChangeEventHandler, type FC } from "react"

import { Input } from "src/components/common/Input"

interface SettingsItemInputProps {
  defaultValue?: string
  onChange: (newValue: string) => any
  type?: "string" | "number"
}

export const SettingsItemInput: FC<SettingsItemInputProps> = ({
  onChange,
  defaultValue: defaultChecked,
  type
}) => {
  const onToggleSwitch: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.currentTarget.value
    onChange(newValue)
  }

  return (
    <Input
      defaultValue={defaultChecked}
      onChange={onToggleSwitch}
      type={type}
    />
  )
}
