import { type FC } from "react"

import { Switch } from "src/components/common/Switch"

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
    <Switch
      defaultChecked={defaultChecked}
      onChange={onToggleSwitch}
    />
  )
}
