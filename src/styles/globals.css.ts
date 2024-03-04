import { createGlobalTheme, globalStyle } from "@vanilla-extract/css"

import { globalTokens, styleTokens } from "./styleTokens.css"

/**
 * Global styles
 */
globalStyle("html, body", {
  margin: "0",
  padding: "0",
  overflow: "hidden",
  fontFamily: styleTokens.fontFamily,
  color: styleTokens.textColor
})

globalStyle("input, text, select, option", {
  color: styleTokens.textColor
})

globalStyle("::-webkit-scrollbar", {
  width: "7px",
  height: "7px"
})

globalStyle("::-webkit-scrollbar-track", {
  background: styleTokens.scrollbarTrackBackgroundColor
})

globalStyle("::-webkit-scrollbar-thumb", {
  background: styleTokens.scrollbarThumbBackgroundColor,
  borderRadius: styleTokens.scrollbarThumbBorderRadius
})

globalStyle("::-webkit-scrollbar-thumb:hover", {
  background: styleTokens.scrollbarThumbBackgroundColorHover
})

/**
 * Global variables
 */
createGlobalTheme("body", globalTokens, {
  fontFamily: "Inter, serif",
  fontMono: "Consolas, monospace, serif",
  fontSize: "13px",
  fontWeight: "400",

  // Colors
  colorAccent: "#275efe",
  accentColorLight20: "color-mix(in srgb, var(--accent-color), #ffffff 20%)",
  accentColorLight40: "color-mix(in srgb, var(--accent-color), #ffffff 40%)",
  accentColorLight60: "color-mix(in srgb, var(--accent-color), #ffffff 60%)",
  accentColorLight80: "color-mix(in srgb, var(--accent-color), #ffffff 80%)",
  accentColorDark20: "color-mix(in srgb, var(--accent-color), #000000 20%)",
  accentColorDark40: "color-mix(in srgb, var(--accent-color), #000000 40%)",
  accentColorDark60: "color-mix(in srgb, var(--accent-color), #000000 60%)",
  accentColorDark80: "color-mix(in srgb, var(--accent-color), #000000 80%)",

  // General
  borderRadius: "3px",

  // App Titlebar
  appTitlebarHeight: "37px",

  // Window control buttons
  windowControlButtonWidth: "50px",
  windowControlButtonHeight: "36px",

  // Tool
  appletHeaderHeight: "60px",

  // Session tabbar
  sessionTabbarHeight: "37px",
  sessionTabbarItemMaxWidth: "200px",
  sessionTabbarDraggableHeight: "0px",

  // Animations
  animationSpeed: "0.15s",

  // Sidebar
  activitybarWidth: "50px",
  activitybarItemHeight: "30px",
  primarySidebarWidth: "250px",

  // Input and output component styles
  inputOutputFieldsSpacing: "15px",
  inputOutputLabelHeight: "20px",
  inputOutputLabelSpacing: "10px",
  inputOutputPadding: "7px",
  inputOutputFontSize: "14px",

  contexifyMenuShadow: "none",
  contexifyMenuMinWidth: "250px",
  contexifyMenuPadding: "5px",
  contexifyMenuRadius: styleTokens.borderRadius,
  contexifyItemContentPadding: "5px 10px"
})
