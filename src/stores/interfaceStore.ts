import { makeAutoObservable } from "mobx"
import { getWindowSize } from "src/utils/getWindowSize"

class InterfaceStore {
  isSidebarHidden = false

  sidebarMode: "dock-pinned" | "float-unpinned" = "dock-pinned"

  textAreaWordWrap = false

  windowSize = {
    width: 0,
    height: 0
  }

  constructor() {
    this.recalculateWindowSize()
    makeAutoObservable(this)
  }

  toggleSidebar() {
    this.isSidebarHidden = !this.isSidebarHidden
  }

  hideSidebar() {
    this.isSidebarHidden = true
  }

  recalculateWindowSize() {
    this.windowSize = getWindowSize()
  }
}

export const interfaceStore = new InterfaceStore()
