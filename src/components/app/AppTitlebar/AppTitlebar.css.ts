import { style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

export const appTitlebarClasses = {
  root: style({
    height: styleTokens.appTitlebarHeight,
    userSelect: "none",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: styleTokens.appTitlebarBackgroundColor,
    borderBottom: `1px solid ${styleTokens.borderColor}`
  })
}
