import { observer } from "mobx-react"
import { type FC, useEffect } from "react"

import { SidebarMode } from "src/enums/SidebarMode"
import { interfaceStore } from "src/stores/interfaceStore"

export const AppWindowSizeObserver: FC = observer(() => {
  useEffect(() => {
    if (interfaceStore.windowSize.width > 870 && interfaceStore.sidebarMode !== SidebarMode.DOCK_PINNED) {
      interfaceStore.sidebarMode = SidebarMode.DOCK_PINNED
      interfaceStore.showSidebar()
    } else if (interfaceStore.windowSize.width <= 870 && interfaceStore.sidebarMode !== SidebarMode.FLOAT_UNPINNED) {
      interfaceStore.sidebarMode = SidebarMode.FLOAT_UNPINNED
      interfaceStore.hideSidebar()
    }
  }, [interfaceStore.windowSize])

  return null
})
