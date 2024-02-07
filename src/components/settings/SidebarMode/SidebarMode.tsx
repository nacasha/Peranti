import { observer } from "mobx-react"
import { type FC } from "react"

import { Switch } from "src/components/common/Switch"
import { interfaceStore } from "src/services/interface-store"

export const SidebarMode: FC = observer(() => {
  const onToggleSwitch = () => {
    interfaceStore.toggleSidebarAlwaysFloating()
  }

  return (
    <Switch
      defaultChecked={interfaceStore.isFloatingSidebar}
      onChange={onToggleSwitch}
    />
  )
})
