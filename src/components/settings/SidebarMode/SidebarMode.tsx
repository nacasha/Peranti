import { observer } from "mobx-react"
import { type FC } from "react"

import { Switch } from "src/components/common/Switch"
import { interfaceStore } from "src/stores/interfaceStore.ts"

export const SidebarMode: FC = observer(() => {
  const onToggleSwitch = () => {
    interfaceStore.toggleSidebarAlwaysFloating()
  }

  return (
    <Switch
      defaultChecked={interfaceStore.isSidebarAlwaysFloating}
      onChange={onToggleSwitch}
    />
  )
})
