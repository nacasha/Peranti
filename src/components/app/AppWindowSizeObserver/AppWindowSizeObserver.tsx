import { observer } from "mobx-react"
import { type FC, useEffect } from "react"

import { SidebarMode } from "src/enums/SidebarMode"
import { interfaceStore } from "src/stores/interfaceStore"

export const AppWindowSizeObserver: FC = observer(() => {
  const { windowSize, sidebarMode, isSidebarAlwaysFloating } = interfaceStore

  useEffect(() => {
    if (windowSize.width > 870 && sidebarMode !== SidebarMode.DOCK_PINNED) {
      if (!isSidebarAlwaysFloating) {
        interfaceStore.sidebarMode = SidebarMode.DOCK_PINNED
        interfaceStore.showSidebar()
      }
    } else if (windowSize.width <= 870 && sidebarMode !== SidebarMode.FLOAT_UNPINNED) {
      interfaceStore.sidebarMode = SidebarMode.FLOAT_UNPINNED
      interfaceStore.hideSidebar()
    }
  }, [windowSize])

  return null
})
