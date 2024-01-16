import { observer } from "mobx-react"
import { type FC, useEffect } from "react"

import { SidebarMode } from "src/enums/SidebarMode"
import { interfaceStore } from "src/stores/interfaceStore"

export const AppWindowSizeObserver: FC = observer(() => {
  const { windowSize, sidebarMode, isFloatingSidebar } = interfaceStore

  useEffect(() => {
    if (windowSize.width > 870 && sidebarMode !== SidebarMode.DockPinned) {
      if (!isFloatingSidebar) {
        interfaceStore.sidebarMode = SidebarMode.DockPinned
        interfaceStore.showSidebar()
      }
    } else if (windowSize.width <= 870 && sidebarMode !== SidebarMode.FloatUnpinned) {
      interfaceStore.sidebarMode = SidebarMode.FloatUnpinned
      interfaceStore.hideSidebar()
    }
  }, [windowSize])

  return null
})
