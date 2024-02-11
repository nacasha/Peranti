import { createGlobalTheme, createGlobalThemeContract, globalStyle } from "@vanilla-extract/css"

import { globalTokens, styleTokens } from "./styleTokens.css"

/**
 * Global styles
 */
globalStyle("html, body", {
  margin: "0",
  padding: "0",
  overflow: "hidden",
  fontFamily: styleTokens.font.body,
  color: styleTokens.text.color
})

globalStyle("input, text, select, option", {
  color: styleTokens.text.color
})

globalStyle("::-webkit-scrollbar", {
  width: 7,
  height: 7
})

globalStyle("::-webkit-scrollbar-track", {
  background: styleTokens.scrollbar.track.background
})

globalStyle("::-webkit-scrollbar-thumb", {
  background: styleTokens.scrollbar.thumb.background,
  borderRadius: styleTokens.scrollbar.thumb.borderRadius
})

globalStyle("::-webkit-scrollbar-thumb:hover", {
  background: styleTokens.scrollbar.thumb.backgroundHover
})

/**
 * Global variables
 */
createGlobalTheme("body", createGlobalThemeContract(globalTokens), {
  font: {
    body: "'Inter', serif",
    mono: "'Consolas', monospace, serif",
    size: "13px"
  },

  color: {
    accent: "#275efe"
  },

  border: {
    radius: "4px"
  },

  // Colors
  accentColorLight20: "color-mix(in srgb, var(--accent-color), #ffffff 20%)",
  accentColorLight40: "color-mix(in srgb, var(--accent-color), #ffffff 40%)",
  accentColorLight60: "color-mix(in srgb, var(--accent-color), #ffffff 60%)",
  accentColorLight80: "color-mix(in srgb, var(--accent-color), #ffffff 80%)",

  accentColorDark20: "color-mix(in srgb, var(--accent-color), #000000 20%)",
  accentColorDark40: "color-mix(in srgb, var(--accent-color), #000000 40%)",
  accentColorDark60: "color-mix(in srgb, var(--accent-color), #000000 60%)",
  accentColorDark80: "color-mix(in srgb, var(--accent-color), #000000 80%)",

  // General
  borderRadius: "4px",

  // App Titlebar
  appTitlebarHeight: "37px",
  windowControlButtonWidth: "50px",
  windowControlButtonHeight: "36px",

  // Tool
  appletHeaderHeight: "45px",
  sessionTabbarHeight: "37px",
  sessionTabbarItemMaxWidth: "200px",

  // Animations
  transitionSpeed: "0s",

  // Sidebar
  activitybarWidth: "50px",
  activitybarItemHeight: "30px",
  primarySidebarWidth: "250px",

  // Input and output component styles
  inputOutputFieldsSpacing: "15px",
  inputOutputLabelHeight: "13px",
  inputOutputLabelSpacing: "10px",
  inputOutputPadding: "7px",
  inputOutputFontSize: "14px",

  contextMenu: {
    menuShadow: "none",
    menuMinWidth: "250px",
    menuPadding: "5px",
    menuRadius: styleTokens.borderRadius,
    itemContentPadding: "5px 10px"
  }
})
