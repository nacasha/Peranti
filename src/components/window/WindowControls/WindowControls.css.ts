import { globalStyle, style } from "@vanilla-extract/css"

import { sessionTabbarClasses } from "src/components/session/SessionTabbar/SessionTabbar.css"
import { appClasses } from "src/styles/app.css"
import { styleTokens } from "src/styles/styleTokens.css"

export const windowControlsClasses = {
  root: style({
    selectors: {
      [`${appClasses.root}${appClasses.withTabbar} &`]: {
        borderBottom: `1px solid ${styleTokens.borderColor}`,
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
  })
}

globalStyle(`${windowControlsClasses.button} img`, {
  width: "14px",
  filter: styleTokens.iconColorFilter
})
