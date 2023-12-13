import { makeAutoObservable } from "mobx"

import { SidebarMode } from "src/enums/SidebarMode"
import { getWindowSize } from "src/utils/getWindowSize"

class InterfaceStore {
  _isSidebarShow = true

  sidebarMode: SidebarMode = SidebarMode.DOCK_PINNED

  sidebarActiveMenuId = "tools"

  textAreaWordWrap = false

  windowSize = {
    width: 0,
    height: 0
  }

  constructor() {
    this.recalculateWindowSize()
    makeAutoObservable(this)
  }

  recalculateWindowSize() {
    this.windowSize = getWindowSize()
  }

  get isSidebarShow() {
    return this._isSidebarShow
  }

  toggleSidebar() {
    this._isSidebarShow = !this._isSidebarShow
  }

  hideSidebar() {
    this._isSidebarShow = false
  }

  showSidebar() {
    this._isSidebarShow = true
  }

  setSidebarMenuId(menuId: string) {
    this.sidebarActiveMenuId = menuId
  }
}

export const interfaceStore = new InterfaceStore()
