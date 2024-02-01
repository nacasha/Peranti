import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"
import { SidebarMode } from "src/enums/SidebarMode"
import { Theme } from "src/enums/ThemeEnum.ts"
import { getWindowSize } from "src/utils/getWindowSize"

class InterfaceStore {
  /**
   * Currently active theme
   *
   * @configurable
   */
  theme: Theme = Theme.Dark

  /**
   * Show the sidebar
   */
  _isSidebarShow = true

  /**
   * App Sidebar mode
   *
   * @configurable
   */
  _sidebarMode: SidebarMode = SidebarMode.DockPinned

  /**
   * Save last tool and input state
   */
  _restoreLastToolInputAndOutput = false

  /**
   * Make App Sidebar alaways floating (hide on click outside)
   */
  isFloatingSidebar = false

  /**
   * Currently active menu id
   */
  sidebarActiveMenuId = "tools"

  /**
   * Make text area and code component text wrap
   *
   * @configurable
   */
  textAreaWordWrap = false

  /**
   * State of window size
   */
  windowSize = {
    width: 0,
    height: 0
  }

  constructor() {
    this.recalculateWindowSize()
    makeAutoObservable(this)

    void makePersistable(this, {
      name: StorageKeys.InterfaceStore,
      storage: localforage,
      stringify: false,
      properties: [
        "isFloatingSidebar",
        "_isSidebarShow",
        "_sidebarMode",
        "textAreaWordWrap",
        "theme",
        "_restoreLastToolInputAndOutput"
      ]
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
    return this.theme === Theme.Dark
  }

  get sidebarMode() {
    if (this.isFloatingSidebar) return SidebarMode.FloatUnpinned
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
    this.isFloatingSidebar = !this.isFloatingSidebar
  }

  setSidebarMenuId(menuId: string) {
    this.sidebarActiveMenuId = menuId
  }

  setRestoreLastToolInputAndOutput(value: boolean) {
    this._restoreLastToolInputAndOutput = value
  }
}

export const interfaceStore = new InterfaceStore()
