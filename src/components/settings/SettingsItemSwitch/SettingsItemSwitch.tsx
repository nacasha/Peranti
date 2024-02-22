import { type FC } from "react"

import { Checkbox } from "src/components/common/Checkbox"

interface SettingsItemSwitchProps {
  defaultChecked?: boolean
  onChange: (checked: boolean) => any
}

export const SettingsItemSwitch: FC<SettingsItemSwitchProps> = (props) => {
  const { onChange, defaultChecked } = props

  const onToggleSwitch = (checked: boolean) => {
    onChange(checked)
  }

  return (
    <Checkbox
      defaultChecked={defaultChecked}
      onChange={onToggleSwitch}
    />
  )
}
