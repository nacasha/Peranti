import { createGlobalThemeContract } from "@vanilla-extract/css"
import { merge } from "ts-deepmerge"

/**
 * Context menu library style variables
 */
const contextMenu = {
  menuShadow: "contexify-menu-shadow",
  menuMinWidth: "contexify-menu-minWidth",
  menuPadding: "contexify-menu-padding",
  menuRadius: "contexify-menu-radius",
  itemContentPadding: "contexify-itemContent-padding"
}

export const globalTokens = {
  font: {
    body: "font-family",
    mono: "font-family-mono",
    size: "font-size"
  },

  color: {
    accent: "accent-color"
  },

  border: {
    radius: "border-radius"
  },

  // Colors
  accentColorLight20: "accent-color-light-20",
  accentColorLight40: "accent-color-light-40",
  accentColorLight60: "accent-color-light-60",
  accentColorLight80: "accent-color-light-80",

  accentColorDark20: "accent-color-dark-20",
  accentColorDark40: "accent-color-dark-40",
  accentColorDark60: "accent-color-dark-60",
  accentColorDark80: "accent-color-dark-80",

  // General
  borderRadius: "border-radius",

  // App Titlebar
  appTitlebarHeight: "app-titlebar-height",
  windowControlButtonWidth: "window-control-button-width",
  windowControlButtonHeight: "window-control-button-height",

  // Tool
  appletHeaderHeight: "applet-header-height",
  sessionTabbarHeight: "session-tabbar-height",
  sessionTabbarItemMaxWidth: "session-tabbar-item-max-width",

  // Animations
  transitionSpeed: "transition-speed",

  // Sidebar
  activitybarWidth: "activitybar-width",
  activitybarItemHeight: "activitybar-item-height",
  primarySidebarWidth: "primary-sidebar-width",

  // Input and output component styles
  inputOutputFieldsSpacing: "input-output-fields-spacing",
  inputOutputLabelHeight: "input-output-label-height",
  inputOutputLabelSpacing: "input-output-label-spacing",
  inputOutputPadding: "input-output-padding",
  inputOutputFontSize: "input-output-font-size",

  contextMenu
}

export const themeableTokens = {
  border: {
    color: "border-color"
  },

  text: {
    color: "text-color"
  },

  icon: {
    colorFilter: "icon-color"
  },

  color: {
    oppositeColor: "opposite-color"
  },

  button: {
    backgroundColor: "button-background-color",
    backgroundColorHover: "button-background-color-hover",
    backgroundColorActive: "button-background-color-active",
    borderColor: "button-border-color",
    borderColorHover: "button-border-color-hover",
    borderColorActive: "button-border-color-actived"
  },

  background: {
    main: "background-color-main",
    content: "background-color-content"
  },

  activitybar: {
    backgroundColor: "activitybar-background-color",
    itemBackgroundColorHover: "activitybar-item-background-color-hover",
    itemBackgroundColorActive: "activitybar-item-background-color-active"
  },

  primarySidebar: {
    backgroundColor: "primary-sidebar-background-color"
  },

  statusbar: {
    backgroundColor: "statusbar-background-color"
  },

  components: {
    backgroundColor: "input-output-background-color",
    borderColor: "input-output-border-color",
    borderColorHover: "input-output-border-color-hover",
    borderColorActive: "input-output-border-color-active"
  },

  sessionTabbar: {
    backgroundColor: "session-tabbar-background-color",
    color: "session-tabbar-color",
    colorHover: "session-tabbar-color-hover",
    textColor: "session-tabbar-text-color",
    textColorActive: "session-tabbar-text-color-active"
  },

  appletHeader: {
    backgroundColor: "applet-header-background-color"
  },

  appletViewer: {
    backgroundColor: "applet-viewer-background-color"
  },

  toolSidebar: {
    textColor: "tool-sidebar-text-color",
    textColorActive: "tool-sidebar-text-color-active",
    iconColor: "tool-sidebar-icon-color",
    iconColorActive: "tool-sidebar-icon-color-active"
  },

  settingsView: {
    backgroundColor: "settings-view-background-color",
    cardBackgroundColor: "settings-view-card-background-color"
  },

  scrollbar: {
    track: {
      background: "scrollbar-track-background"
    },
    thumb: {
      background: "scrollbat-thumb-background",
      backgroundHover: "scrollbat-thumb-background-hover",
      borderRadius: "scrollbat-thumb-border-radius"
    }
  }
}

export const styleTokens = createGlobalThemeContract(merge(themeableTokens, globalTokens))
