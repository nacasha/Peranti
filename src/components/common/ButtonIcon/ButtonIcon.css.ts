import { style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

export const buttonIconClasses = {
  root: style({
    display: "flex",
    alignItems: "center",
    userSelect: "none",
    padding: 5,
    borderRadius: styleTokens.borderRadius,

    ":hover": {
      background: "color-mix(in srgb, var(--background-color-main), var(--opposite-color) 10%)",
      cursor: "pointer"
    }
  }),

  icon: style({
    width: "15px",
    filter: styleTokens.iconColorFilter
  })
}
