import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { SidebarMode } from "src/enums/SidebarMode"
import { ThemeEnum } from "src/enums/ThemeEnum.ts"
import { getWindowSize } from "src/utils/getWindowSize"

class InterfaceStore {
  theme: ThemeEnum = ThemeEnum.Dark

  _isSidebarShow = true

  _sidebarMode: SidebarMode = SidebarMode.DockPinned

  _restoreLastToolInputAndOutput = false

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
      properties: [
        "isSidebarAlwaysFloating",
        "_isSidebarShow",
        "_sidebarMode",
        "textAreaWordWrap",
        "theme",
        "_restoreLastToolInputAndOutput"
      ],
      storage: window.localStorage
    })
  }

  recalculateWindowSize() {
    this.windowSize = getWindowSize()
  }

  get isSidebarShow() {
    return this._isSidebarShow
  }

  get restoreLastToolInputAndOutput() {
    return this._restoreLastToolInputAndOutput
  }

  get isThemeDarkMode() {
    return this.theme === ThemeEnum.Dark
  }

  get sidebarMode() {
    if (this.isSidebarAlwaysFloating) return SidebarMode.FloatUnpinned
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

  setRestoreLastToolInputAndOutput(value: boolean) {
    this._restoreLastToolInputAndOutput = value
  }
}

export const interfaceStore = new InterfaceStore()
