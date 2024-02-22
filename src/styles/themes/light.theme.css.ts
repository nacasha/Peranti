import { createTheme } from "@vanilla-extract/css"

import { themeableTokens } from "../styleTokens.css"

export const lightThemeClass = createTheme(themeableTokens, {
  borderColor: "#cbcccd",
  textColor: "#0f0f0f",
  iconColorFilter: "invert(23%) sepia(1%) saturate(4546%) hue-rotate(38deg) brightness(105%) contrast(85%)",
  colorOppositeColor: "#939393",
  appTitlebarBackgroundColor: "#ffffff",
  buttonBackgroundColor: "linear-gradient(0deg, #f7f7f7 0%, #ffffff 100%)",
  buttonBackgroundColorHover: "#efefef",
  buttonBackgroundColorActive: "#ececec",
  buttonBorderColor: "#cbcccd",
  buttonBorderColorHover: "#cbcccd",
  buttonBorderColorActive: "#cbcccd",
  backgroundMain: "#ffffff",
  backgroundContent: "#ffffff",
  activitybarBackgroundColor: "#ffffff",
  activitybarItemBackgroundColorHover: "#dfdddd",
  activitybarItemBackgroundColorActive: "#d6d6d6",
  primarySidebarBackgroundColor: "#f6f8fa",

  /**
   * Secondary Sidebar
   */
  secondaySidebarBackgroundColor: "#ffffff",
  secondaySidebarItemBackgroundColorHover: "#efefef",

  bottomPanelBackgroundColor: "#ffffff",
  statusbarBackgroundColor: "#f6f6f6",
  inputOutputBackgroundColor: "#ffffff",
  inputOutputBorderColor: "var(--border-color)",
  inputOutputBorderColorHover: "var(--input-output-border-color)",
  inputOutputBorderColorActive: "var(--input-output-border-color)",
  sessionTabbarBackgroundColor: "#ffffff",
  sessionTabbarColor: "#ffffff",
  sessionTabbarColorHover: "#f6f8fa",
  sessionTabbarTextColor: "#585858",
  sessionTabbarTextColorActive: "#000000",
  appletHeaderBackgroundColor: "#ffffff",
  appletViewerBackgroundColor: "#f9f9fc",
  toolSidebarTextColor: "#212418",
  toolSidebarTextColorActive: "#000000",
  toolSidebarIconColor: "invert(11%) sepia(7%) saturate(1891%) hue-rotate(34deg) brightness(98%) contrast(92%)",
  toolSidebarIconColorActive: "invert(98%) sepia(1%) saturate(321%) hue-rotate(234deg) brightness(116%) contrast(100%)",
  toolSidebarBackgroundColorActive: "#dfdfdf",
  settingsViewBackgroundColor: "#f9f9fc",
  settingsViewCardBackgroundColor: "#ffffff",
  scrollbarTrackBackgroundColor: "#ffffff",
  scrollbarThumbBackgroundColor: "#8b8b8b",
  scrollbarThumbBackgroundColorHover: "#555",
  scrollbarThumbBorderRadius: "4px",

  /**
   * Tooltip
   */
  tooltipTextColor: "var(--text-color)",
  tooltipBackgroundColor: "#1e1f22",
  tooltipBorderColor: "#454545"
})
