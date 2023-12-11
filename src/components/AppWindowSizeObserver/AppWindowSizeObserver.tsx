import { observer } from "mobx-react"
import { type FC, useEffect } from "react"
import { interfaceStore } from "src/store/interfaceStore"

export const AppWindowSizeObserver: FC = observer(() => {
  useEffect(() => {
    if (interfaceStore.windowSize.width > 870 && interfaceStore.sidebarMode !== "dock-pinned") {
      interfaceStore.sidebarMode = "dock-pinned"
      interfaceStore.isSidebarHidden = false
    } else if (interfaceStore.windowSize.width <= 870 && interfaceStore.sidebarMode !== "float-unpinned") {
      interfaceStore.sidebarMode = "float-unpinned"
      interfaceStore.isSidebarHidden = true
    }
  }, [interfaceStore.windowSize])

  return null
})
