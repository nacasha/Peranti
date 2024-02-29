import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { StorageKeys } from "src/constants/storage-keys"
import { AppTitleBarStyle as AppTitlebarStyle } from "src/enums/app-titlebar-style"
import { SidebarMode } from "src/enums/sidebar-mode"
import { Theme } from "src/enums/theme-2.js"
import { UserSettingsKeys } from "src/enums/user-settings-keys"
import { getWindowSize } from "src/utils/get-window-size"

import { userSettingsService } from "./user-settings-service.js"

class InterfaceStore {
  @userSettingsService.watch(UserSettingsKeys.theme)
  theme: Theme = userSettingsService.get(UserSettingsKeys.theme, Theme.Dark)

  @userSettingsService.watch(UserSettingsKeys.floatingSidebar)
  isFloatingSidebar = userSettingsService.get(UserSettingsKeys.floatingSidebar, false)

  @userSettingsService.watch(UserSettingsKeys.titlebarStyle)
  appTitlebarStyle = userSettingsService.get(UserSettingsKeys.titlebarStyle, AppTitlebarStyle.Commandbar)

  @userSettingsService.watch(UserSettingsKeys.textAreaWordWrap)
  textAreaWordWrap = userSettingsService.get(UserSettingsKeys.textAreaWordWrap, false)

  isSidebarShow = true

  _sidebarMode: SidebarMode = SidebarMode.DockPinned

  sidebarActiveMenuId = "tools"

  windowSize = { width: 0, height: 0 }

  isWindowMaximized: boolean = false

  constructor() {
    makeAutoObservable(this)

    this.recalculateWindowSize()
    this.setupPersistence()
    userSettingsService.watchStore(this)
  }

  setupPersistence() {
    void makePersistable(this, {
      name: StorageKeys.InterfaceStore,
      storage: localforage,
      stringify: false,
      properties: [
        "isSidebarShow",
        "_sidebarMode"
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
    this.isSidebarShow = !this.isFloatingSidebar
  }

  setSidebarMenuId(menuId: string) {
    this.sidebarActiveMenuId = menuId
  }

  setTheme(theme: any) {
    this.theme = theme
  }

  setAppTitlebarStyle(style: AppTitlebarStyle) {
    this.appTitlebarStyle = style
  }

  setIsWindowMaximized(value: boolean) {
    this.isWindowMaximized = value
  }

  get isDarkTheme() {
    return this.theme === Theme.Dark
  }
}

export const interfaceStore = new InterfaceStore()
