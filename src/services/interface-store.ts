import localforage from "localforage"
import { makeAutoObservable } from "mobx"
import { makePersistable } from "mobx-persist-store"

import { GlobalStyleVariables } from "src/constants/global-style-variables.js"
import { StorageKeys } from "src/constants/storage-keys"
import { AppTitleBarStyle as AppTitlebarStyle } from "src/enums/app-titlebar-style"
import { SidebarMode } from "src/enums/sidebar-mode"
import { type ResolvedTheme, Theme } from "src/enums/theme-2.js"
import { UserSettingsKeys } from "src/enums/user-settings-keys"
import { getSystemTheme, resolveTheme, watchSystemTheme } from "src/utils/get-system-theme"
import { getWindowSize } from "src/utils/get-window-size"

import { globalStyles } from "./global-styles.js"
import { userSettingsService } from "./user-settings-service.js"

class InterfaceStore {
  /**
   * User theme preference
   * Dark, Light, or System (follows the operating system color scheme)
   */
  @userSettingsService.watch(UserSettingsKeys.theme)
  theme: Theme = userSettingsService.get(UserSettingsKeys.theme, Theme.Dark)

  /**
   * Current operating system color scheme, kept in sync with `prefers-color-scheme`.
   * Only used when the preference is `Theme.System`.
   */
  systemTheme: ResolvedTheme = getSystemTheme()

  /**
   * Sidebar view mode
   *
   * TODO: Currently disabled because need a feature to show the hidden sidebar when active
   */
  @userSettingsService.watch(UserSettingsKeys.floatingSidebar)
  isFloatingSidebar = userSettingsService.get(UserSettingsKeys.floatingSidebar, false)

  /**
   * Application tabbar style
   */
  @userSettingsService.watch(UserSettingsKeys.titlebarStyle)
  appTitlebarStyle = userSettingsService.get(UserSettingsKeys.titlebarStyle, AppTitlebarStyle.Tabbar)

  /**
   * Enable the word wrap on text editor input and output fields
   */
  @userSettingsService.watch(UserSettingsKeys.textAreaWordWrap)
  textAreaWordWrap = userSettingsService.get(UserSettingsKeys.textAreaWordWrap, false)

  /**
   * Font family used for editor input and output
   */
  @userSettingsService.watch(UserSettingsKeys.editorFontFamily)
  editorFontFamily = userSettingsService.get(UserSettingsKeys.editorFontFamily, "JetBrains Mono")

  /**
   * Font size used for editot input and output
   */
  @userSettingsService.watch(UserSettingsKeys.editorFontSize)
  editorFontSize = userSettingsService.get(UserSettingsKeys.editorFontSize, 13)

  /**
   * State of sidebar show
   */
  isSidebarShow = true

  /**
   * Internal state of sidebar view mode, when the application window size smaller
   * than defined sizes, the sidebar will automatically goes into 'FloatUnpinned',
   * means the sidebar will floating and get hidden when click on the item or outside
   * the sidebar
   *
   * TODO: Currently no way to show the hidden sidebar unless resize the application window
   */
  _sidebarMode: SidebarMode = SidebarMode.DockPinned

  /**
   * TODO: Used to show currently active sidebar content
   */
  sidebarActiveMenuId = "tools"

  /**
   * State of current window width and height
   */
  windowSize = { width: 0, height: 0 }

  /**
   * State of current maximized window
   */
  isWindowMaximized: boolean = false

  /**
   * InterfaceStore constructor
   */
  constructor() {
    makeAutoObservable(this)

    this.recalculateWindowSize()
    this.setupPersistence()
    userSettingsService.watchStore(this)

    watchSystemTheme((theme) => { this.setSystemTheme(theme) })
  }

  /**
   * Make persistable and load persisted data on user local storage
   */
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

  setTheme(theme: Theme) {
    this.theme = theme
  }

  setSystemTheme(theme: ResolvedTheme) {
    this.systemTheme = theme
  }

  setAppTitlebarStyle(style: AppTitlebarStyle) {
    this.appTitlebarStyle = style
  }

  setIsWindowMaximized(value: boolean) {
    this.isWindowMaximized = value
  }

  toggleTextAreaWordWrap() {
    this.textAreaWordWrap = !this.textAreaWordWrap
  }

  setEditorFontFamily(newEditorFontFamily: string) {
    this.editorFontFamily = newEditorFontFamily
    globalStyles.setVariable(GlobalStyleVariables.editorFontFamily, newEditorFontFamily)
  }

  setEditorFontSize(newEditorFontSize: string) {
    this.editorFontSize = newEditorFontSize
    globalStyles.setVariable(GlobalStyleVariables.editorFontSize, `${newEditorFontSize}px`)
  }

  /**
   * Theme applied to the interface, with `Theme.System` resolved to the
   * current operating system color scheme.
   */
  get resolvedTheme(): ResolvedTheme {
    return resolveTheme(this.theme, this.systemTheme)
  }

  get isDarkTheme() {
    return this.resolvedTheme === Theme.Dark
  }
}

export const interfaceStore = new InterfaceStore()
