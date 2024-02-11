import { globalStyle, style } from "@vanilla-extract/css"

import { styleTokens } from "../styleTokens.css"

export const notificationClassNames = {
  container: style({
    inset: "10px !important",
    bottom: "35px !important"
  }),

  item: style({
    background: "#1e1f22",
    fontFamily: "var(--font-family)",
    fontSize: "var(--font-size)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: styleTokens.borderRadius,
    borderRadius: "4px",
    padding: "7px",
    paddingLeft: "10px",
    color: "#bcbec4",
    animation: "none"
  })
}

globalStyle(`${notificationClassNames.item} "div[role="status"]"`, {
  wordBreak: "normal"
})
