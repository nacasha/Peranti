import { createGlobalThemeContract } from "@vanilla-extract/css"

const _globalTokens = {
  /**
   * General
   */
  borderRadius: "border-radius",
  transitionSpeed: "transition-speed",

  /**
   * Fonts
   */
  fontFamily: "font-family",
  fontMono: "font-family-mono",
  fontSize: "font-size",
  fontWeight: "font-weight",

  /**
   * Colors
   */
  colorAccent: "accent-color",
  accentColorLight20: "accent-color-light-20",
  accentColorLight40: "accent-color-light-40",
  accentColorLight60: "accent-color-light-60",
  accentColorLight80: "accent-color-light-80",
  accentColorDark20: "accent-color-dark-20",
  accentColorDark40: "accent-color-dark-40",
  accentColorDark60: "accent-color-dark-60",
  accentColorDark80: "accent-color-dark-80",

  /**
   * App titlebar
   */
  appTitlebarHeight: "app-titlebar-height",

  /**
   * Window controls button
   */
  windowControlButtonWidth: "window-control-button-width",
  windowControlButtonHeight: "window-control-button-height",

  /**
   * Applet header
   */
  appletHeaderHeight: "applet-header-height",

  /**
   * Session tabbar
   */
  sessionTabbarHeight: "session-tabbar-height",
  sessionTabbarItemMaxWidth: "session-tabbar-item-max-width",
  sessionTabbarDraggableHeight: "session-tabbar-draggable-height",

  /**
   * Activitybar
   */
  activitybarWidth: "activitybar-width",
  activitybarItemHeight: "activitybar-item-height",

  /**
   * Primary sidebar
   */
  primarySidebarWidth: "primary-sidebar-width",

  /**
   * Input and output applet components
   */
  inputOutputFieldsSpacing: "input-output-fields-spacing",
  inputOutputLabelHeight: "input-output-label-height",
  inputOutputLabelSpacing: "input-output-label-spacing",
  inputOutputPadding: "input-output-padding",
  inputOutputFontSize: "input-output-font-size",

  /**
   * Context menu library style variables
   */
  contexifyMenuShadow: "contexify-menu-shadow",
  contexifyMenuMinWidth: "contexify-menu-minWidth",
  contexifyMenuPadding: "contexify-menu-padding",
  contexifyMenuRadius: "contexify-menu-radius",
  contexifyItemContentPadding: "contexify-itemContent-padding"
}

const _themeableTokens = {
  /**
   * General
   */
  borderColor: "border-color",
  backgroundMain: "background-color-main",
  backgroundContent: "background-color-content",

  /**
   * Text and fonts
   */
  textColor: "text-color",

  /**
   * Icon
   */
  iconColorFilter: "icon-color",

  /**
   * Color
   */
  colorOppositeColor: "opposite-color",

  /**
   * App Titlebar
   */
  appTitlebarBackgroundColor: "app-titlebar-background-color",

  /**
   * Button
   */
  buttonBackgroundColor: "button-background-color",
  buttonBackgroundColorHover: "button-background-color-hover",
  buttonBackgroundColorActive: "button-background-color-active",
  buttonBorderColor: "button-border-color",
  buttonBorderColorHover: "button-border-color-hover",
  buttonBorderColorActive: "button-border-color-actived",

  /**
   * Activitybar
   */
  activitybarBackgroundColor: "activitybar-background-color",
  activitybarItemBackgroundColorHover: "activitybar-item-background-color-hover",
  activitybarItemBackgroundColorActive: "activitybar-item-background-color-active",

  /**
   * Primary sidebar
   */
  primarySidebarBackgroundColor: "primary-sidebar-background-color",

  /**
   * Secondary sidebar
   */
  secondaySidebarBackgroundColor: "secondary-sidebar-background-color",

  /**
   * Bottom panel
   */
  bottomPanelBackgroundColor: "bottom-panel-background-color",

  /**
   * Statusbar
   */
  statusbarBackgroundColor: "statusbar-background-color",

  /**
   * Input and output components
   */
  inputOutputBackgroundColor: "input-output-background-color",
  inputOutputBorderColor: "input-output-border-color",
  inputOutputBorderColorHover: "input-output-border-color-hover",
  inputOutputBorderColorActive: "input-output-border-color-active",

  /**
   * Session tabbar
   */
  sessionTabbarBackgroundColor: "session-tabbar-background-color",
  sessionTabbarColor: "session-tabbar-color",
  sessionTabbarColorHover: "session-tabbar-color-hover",
  sessionTabbarTextColor: "session-tabbar-text-color",
  sessionTabbarTextColorActive: "session-tabbar-text-color-active",

  /**
   * Applet header
   */
  appletHeaderBackgroundColor: "applet-header-background-color",

  /**
   * Applet viewer area
   */
  appletViewerBackgroundColor: "applet-viewer-background-color",

  /**
   * Tool sidebar
   */
  toolSidebarTextColor: "tool-sidebar-text-color",
  toolSidebarTextColorActive: "tool-sidebar-text-color-active",
  toolSidebarIconColor: "tool-sidebar-icon-color",
  toolSidebarIconColorActive: "tool-sidebar-icon-color-active",

  /**
   * Settings view
   */
  settingsViewBackgroundColor: "settings-background-color",
  settingsViewCardBackgroundColor: "settings-card-background-color",

  /**
   * Srollbar
   */
  scrollbarTrackBackgroundColor: "scrollbar-track-background",
  scrollbarThumbBackgroundColor: "scrollbar-thumb-background",
  scrollbarThumbBackgroundColorHover: "scrollbar-thumb-background-hover",
  scrollbarThumbBorderRadius: "scrollbar-thumb-border-radius"
}

export const themeableTokens = createGlobalThemeContract(_themeableTokens)

export const globalTokens = createGlobalThemeContract(_globalTokens)

export const styleTokens = createGlobalThemeContract({ ..._themeableTokens, ..._globalTokens })
