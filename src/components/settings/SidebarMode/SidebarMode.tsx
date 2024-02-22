import { observer } from "mobx-react"
import { type FC } from "react"

import { Checkbox } from "src/components/common/Checkbox"
import { interfaceStore } from "src/services/interface-store"

export const SidebarMode: FC = observer(() => {
  const onToggleSwitch = () => {
    interfaceStore.toggleSidebarAlwaysFloating()
  }

  return (
    <Checkbox
      defaultChecked={interfaceStore.isFloatingSidebar}
      onChange={onToggleSwitch}
    />
  )
})
