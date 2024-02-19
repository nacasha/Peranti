import { globalStyle, style } from "@vanilla-extract/css"

import { sessionTabbarClasses } from "src/components/session/SessionTabbar/SessionTabbar.css"
import { appClasses } from "src/styles/app.css"
import { styleTokens } from "src/styles/styleTokens.css"

export const windowControlsClasses = {
  root: style({
    display: "flex",
    selectors: {
      [`${appClasses.root}${appClasses.withTabbar} &`]: {
        top: `calc(0px - ${styleTokens.sessionTabbarDraggableHeight})`,
        paddingBottom: styleTokens.sessionTabbarDraggableHeight
      },

      [`${appClasses.root}${appClasses.withTabbar}${appClasses.withMaximized} &`]: {
        top: 0,
        paddingBottom: 0
      },

      [`${sessionTabbarClasses.root} &`]: {
        position: "absolute",
        right: 0
      }
    }
  }),

  button: style({
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    height: styleTokens.windowControlButtonHeight,
    width: styleTokens.windowControlButtonWidth,
    userSelect: "none",

    ":hover": {
      background: "color-mix(in srgb, var(--background-color-main), var(--opposite-color) 10%)"
    },

    selectors: {
      "&:last-child:hover": {
        backgroundColor: "#c42b1c"
      }
    }
  }),

  layoutControls: style({
    display: "flex",
    marginRight: 10,
    gap: 4,
    alignItems: "center"
  }),

  layoutControlsItem: style({
    display: "flex",
    alignItems: "center",
    userSelect: "none",
    marginBlock: 6,
    padding: 5,
    borderRadius: styleTokens.borderRadius,

    ":hover": {
      background: "color-mix(in srgb, var(--background-color-main), var(--opposite-color) 10%)",
      cursor: "pointer"
    }
  }),

  windowControls: style({
    display: "flex"
  })
}

globalStyle(`${windowControlsClasses.button} img`, {
  width: "14px",
  filter: styleTokens.iconColorFilter
})

globalStyle(`${windowControlsClasses.layoutControlsItem} img`, {
  width: "15px",
  filter: styleTokens.iconColorFilter
})
