import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { SidebarMode } from "src/enums/SidebarMode"
import { getWindowSize } from "src/utils/getWindowSize"

class InterfaceStore {
  _isSidebarShow = true

  _sidebarMode: SidebarMode = SidebarMode.DOCK_PINNED

  isSidebarAlwaysFloating = false

  sidebarActiveMenuId = "tools"

  textAreaWordWrap = false

  windowSize = {
    width: 0,
    height: 0
  }

  constructor() {
    this.recalculateWindowSize()
    makeAutoObservable(this)

    void makePersistable(this, {
      name: "InterfaceStore",
      properties: ["isSidebarAlwaysFloating", "_isSidebarShow", "_sidebarMode", "textAreaWordWrap"],
      storage: window.localStorage
    })
  }

  recalculateWindowSize() {
    this.windowSize = getWindowSize()
  }

  get isSidebarShow() {
    return this._isSidebarShow
  }

  get sidebarMode() {
    if (this.isSidebarAlwaysFloating) return SidebarMode.FLOAT_UNPINNED
    return this._sidebarMode
  }

  set sidebarMode(mode: SidebarMode) {
    this._sidebarMode = mode
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

  toggleSidebarAlwaysFloating() {
    this.isSidebarAlwaysFloating = !this.isSidebarAlwaysFloating
  }

  setSidebarMenuId(menuId: string) {
    this.sidebarActiveMenuId = menuId
  }
}

export const interfaceStore = new InterfaceStore()
