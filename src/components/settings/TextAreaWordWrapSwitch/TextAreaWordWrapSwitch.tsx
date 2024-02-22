import { type FC } from "react"

import { Checkbox } from "src/components/common/Checkbox"
import { interfaceStore } from "src/services/interface-store"

export const TextAreaWordWrapSwitch: FC = () => {
  const onToggleSwitch = (checked: boolean) => {
    interfaceStore.textAreaWordWrap = checked
  }

  return (
    <Checkbox
      defaultChecked={interfaceStore.textAreaWordWrap}
      onChange={onToggleSwitch}
    />
  )
}
