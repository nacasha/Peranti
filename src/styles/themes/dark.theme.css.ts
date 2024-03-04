import { createTheme } from "@vanilla-extract/css"

import { themeableTokens } from "../styleTokens.css"

export const darkThemeClass = createTheme(themeableTokens, {
  borderColor: "#2a2a2a",
  textColor: "#e0e0e0",
  iconColorFilter: "invert(90%) sepia(6%) saturate(178%) hue-rotate(187deg) brightness(94%) contrast(88%)",
  colorOppositeColor: "#ffffff",
  appTitlebarBackgroundColor: "#1a1b1d",

  /**
   * Button
   */
  buttonBackgroundColor: "#181818",
  buttonBackgroundColorHover: "#26282a",
  buttonBackgroundColorActive: "#2a2b2d",
  buttonBorderColor: "#3e3e3e",
  buttonBorderColorHover: "#3e3e3e",
  buttonBorderColorActive: "#3e3e3e",

  backgroundMain: "#1a1b1d",
  backgroundContent: "#222429",
  activitybarBackgroundColor: "#181818",
  activitybarItemBackgroundColorHover: "#5a5b5e",
  activitybarItemBackgroundColorActive: "#434549",
  primarySidebarBackgroundColor: "#1a1b1d",

  /**
   * Secondary Sidebar
   */
  secondaySidebarBackgroundColor: "#1a1b1d",
  secondaySidebarItemBackgroundColorHover: "#2a2b2d",

  bottomPanelBackgroundColor: "#181818",
  statusbarBackgroundColor: "#181818",
  inputOutputBackgroundColor: "#292a30",
  inputOutputBorderColor: "#353535",
  inputOutputBorderColorHover: "var(--input-output-border-color)",
  inputOutputBorderColorActive: "var(--input-output-border-color)",
  sessionTabbarBackgroundColor: "#1a1b1d",
  sessionTabbarColor: "#1a1b1d",
  sessionTabbarColorHover: "#1f2022",
  sessionTabbarTextColor: "#939393",
  sessionTabbarTextColorActive: "white",
  appletHeaderBackgroundColor: "#181818",
  appletViewerBackgroundColor: "#1e1f22",

  /**
   * Tool sidebar
   */
  toolSidebarTextColor: "#cfcfcf",
  toolSidebarTextColorActive: "#ffffff",
  toolSidebarIconColor: "invert(99%) sepia(3%) saturate(156%) hue-rotate(232deg) brightness(106%) contrast(62%)",
  toolSidebarIconColorActive: "invert(98%) sepia(1%) saturate(321%) hue-rotate(234deg) brightness(116%) contrast(100%)",
  toolSidebarBackgroundColorHover: "#2a2b2d",
  toolSidebarBackgroundColorActive: "#2e2e33",

  settingsViewBackgroundColor: "#202124",
  settingsViewCardBackgroundColor: "#202124",
  scrollbarTrackBackgroundColor: "transparent",
  scrollbarThumbBackgroundColor: "#393a3f",
  scrollbarThumbBackgroundColorHover: "#555",
  scrollbarThumbBorderRadius: "4px",

  /**
   * Tooltip
   */
  tooltipTextColor: "var(--text-color)",
  tooltipBackgroundColor: "#1e1f22",
  tooltipBorderColor: "#454545",

  /**
   * Dialog
   */
  dialogHeaderBackgroundColor: "var(--dialog-content-background-color)",
  dialogContentBackgroundColor: "#1a1b1d",
  dialogFooterBackgroundColor: "var(--dialog-content-background-color)",
  dialogOverlayColor: "rgba(0, 0, 0, 0.8)"
})
