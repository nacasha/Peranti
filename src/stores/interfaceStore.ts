import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"
import { AppTitleBarStyle } from "src/enums/AppTitleBarStyle"
import { SidebarMode } from "src/enums/SidebarMode"
import { Theme } from "src/enums/ThemeEnum.ts"
import { UserSettingsKeys } from "src/enums/UserSettingsKeys"
import { watchUserSettings, getUserSettings } from "src/utils/decorators"
import { getWindowSize } from "src/utils/getWindowSize"

class InterfaceStore {
  /**
   * Currently active theme
   *
   * @configurable
   */
  @watchUserSettings(UserSettingsKeys.theme)
  theme: Theme = getUserSettings(UserSettingsKeys.theme, Theme.Dark)

  /**
   * Make App Sidebar alaways floating (hide on click outside)
   */
  @watchUserSettings(UserSettingsKeys.floatingSidebar)
  isFloatingSidebar = getUserSettings(UserSettingsKeys.floatingSidebar, false)

  /**
   * Style of app window title bar
   */
  @watchUserSettings(UserSettingsKeys.titlebarStyle)
  titlebarStyle = getUserSettings(UserSettingsKeys.titlebarStyle, AppTitleBarStyle.Tabbar)

  /**
   * Show the sidebar
   */
  isSidebarShow = true

  /**
   * App Sidebar mode
   *
   * @configurable
   */
  _sidebarMode: SidebarMode = SidebarMode.DockPinned

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
  windowSize = { width: 0, height: 0 }

  constructor() {
    makeAutoObservable(this)

    this.recalculateWindowSize()
    this.setupPersistence()

    console.log("Create InterfaceStoress")
  }

  /**
   * Setup store persistence
   */
  setupPersistence() {
    void makePersistable(this, {
      name: StorageKeys.InterfaceStore,
      storage: localforage,
      stringify: false,
      properties: [
        "isFloatingSidebar",
        "isSidebarShow",
        "_sidebarMode",
        "textAreaWordWrap",
        "theme"
      ]
    })
  }

  recalculateWindowSize() {
    this.windowSize = getWindowSize()
  }

  get sidebarMode() {
    if (this.isFloatingSidebar) return SidebarMode.FloatUnpinned
    return this._sidebarMode
  }

  set sidebarMode(mode: SidebarMode) {
    this._sidebarMode = mode
  }

  toggleSidebar() {
    this.isSidebarShow = !this.isSidebarShow
  }

  hideSidebar() {
    this.isSidebarShow = false
  }

  showSidebar() {
    this.isSidebarShow = true
  }

  toggleSidebarAlwaysFloating() {
    this.isFloatingSidebar = !this.isFloatingSidebar
  }

  setSidebarMenuId(menuId: string) {
    this.sidebarActiveMenuId = menuId
  }

  setTheme(theme: any) {
    this.theme = theme
  }
}

export const interfaceStore = new InterfaceStore()
