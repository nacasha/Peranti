import { createGlobalThemeContract, createTheme } from "@vanilla-extract/css"

import { themeableTokens } from "../styleTokens.css"

export const lightThemeClass = createTheme(createGlobalThemeContract(themeableTokens), {
  border: {
    color: "#cbcccd"
  },

  text: {
    color: "#0f0f0f"
  },

  icon: {
    colorFilter: "invert(23%) sepia(1%) saturate(4546%) hue-rotate(38deg) brightness(105%) contrast(85%)"
  },

  color: {
    oppositeColor: "#939393"
  },

  button: {
    backgroundColor: "linear-gradient(0deg, #f7f7f7 0%, #ffffff 100%)",
    backgroundColorHover: "#efefef",
    backgroundColorActive: "#ececec",
    borderColor: "#cbcccd",
    borderColorHover: "#cbcccd",
    borderColorActive: "#cbcccd"
  },

  background: {
    main: "#ffffff",
    content: "#ffffff"
  },

  activitybar: {
    backgroundColor: "#ffffff",
    itemBackgroundColorHover: "#dfdddd",
    itemBackgroundColorActive: "#d6d6d6"
  },

  primarySidebar: {
    backgroundColor: "#f6f8fa"
  },

  statusbar: {
    backgroundColor: "#f6f6f6"
  },

  components: {
    backgroundColor: "#ffffff",
    borderColor: "var(--border-color)",
    borderColorHover: "color-mix(in srgb, var(--border-color), var(--opposite-color) 50%)",
    borderColorActive: "var(--input-output-border-color-hover)"
  },

  sessionTabbar: {
    backgroundColor: "#ffffff",
    color: "#ffffff",
    colorHover: "#f6f8fa",
    textColor: "#585858",
    textColorActive: "#000000"
  },

  appletHeader: {
    backgroundColor: "#ffffff"
  },

  appletViewer: {
    backgroundColor: "#f9f9fc"
  },

  toolSidebar: {
    textColor: "#212418",
    textColorActive: "#ffffff",
    iconColor: "invert(11%) sepia(7%) saturate(1891%) hue-rotate(34deg) brightness(98%) contrast(92%)",
    iconColorActive: "invert(98%) sepia(1%) saturate(321%) hue-rotate(234deg) brightness(116%) contrast(100%)"
  },

  settingsView: {
    backgroundColor: "#f9f9fc",
    cardBackgroundColor: "#ffffff"
  },

  scrollbar: {
    track: {
      background: "ffffff"
    },
    thumb: {
      background: "8b8b8b",
      backgroundHover: "#555",
      borderRadius: "4px"
    }
  }
})
