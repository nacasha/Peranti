import { createGlobalThemeContract, createTheme } from "@vanilla-extract/css"

import { themeableTokens } from "../styleTokens.css"

export const darkThemeClass = createTheme(createGlobalThemeContract(themeableTokens), {
  border: {
    color: "#313131"
  },

  text: {
    color: "#e0e0e0"
  },

  icon: {
    colorFilter: "invert(90%) sepia(6%) saturate(178%) hue-rotate(187deg) brightness(94%) contrast(88%)"
  },

  color: {
    oppositeColor: "#ffffff"
  },

  button: {
    backgroundColor: "#262626",
    backgroundColorHover: "#26282a",
    backgroundColorActive: "#1a1c1e",
    borderColor: "#3e3e3e",
    borderColorHover: "#3e3e3e",
    borderColorActive: "#3e3e3e"
  },

  background: {
    main: "#1a1b1d",
    content: "#222429"
  },

  activitybar: {
    backgroundColor: "#1a1b1d",
    itemBackgroundColorHover: "#5a5b5e",
    itemBackgroundColorActive: "#434549"
  },

  primarySidebar: {
    backgroundColor: "#222429"
  },

  statusbar: {
    backgroundColor: "#181818"
  },

  components: {
    backgroundColor: "#1e1e1e",
    borderColor: "var(--border-color)",
    borderColorHover: "color-mix(in srgb, var(--border-color), var(--opposite-color) 7%)",
    borderColorActive: "var(--input-output-border-color-hover)"
  },

  sessionTabbar: {
    backgroundColor: "#1a1b1d",
    color: "#1a1b1d",
    colorHover: "#1f2022",
    textColor: "#939393",
    textColorActive: "white"
  },

  appletHeader: {
    backgroundColor: "#181818"
  },

  appletViewer: {
    backgroundColor: "#202124"
  },

  toolSidebar: {
    textColor: "#cfcfcf",
    textColorActive: "#ffffff",
    iconColor: "invert(99%) sepia(3%) saturate(156%) hue-rotate(232deg) brightness(106%) contrast(62%)",
    iconColorActive: "invert(98%) sepia(1%) saturate(321%) hue-rotate(234deg) brightness(116%) contrast(100%)"
  },

  settingsView: {
    backgroundColor: "#202124",
    cardBackgroundColor: "#1f2023"
  },

  scrollbar: {
    track: {
      background: "transparent"
    },
    thumb: {
      background: "393a3f",
      backgroundHover: "#555",
      borderRadius: "4px"
    }
  }
})
