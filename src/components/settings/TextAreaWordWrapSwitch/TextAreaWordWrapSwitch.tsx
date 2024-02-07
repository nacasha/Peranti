import { type FC } from "react"

import { Switch } from "src/components/common/Switch"
import { interfaceStore } from "src/services/interface-store"

export const TextAreaWordWrapSwitch: FC = () => {
  const onToggleSwitch = (checked: boolean) => {
    interfaceStore.textAreaWordWrap = checked
  }

  return (
    <Switch
      defaultChecked={interfaceStore.textAreaWordWrap}
      onChange={onToggleSwitch}
    />
  )
}
