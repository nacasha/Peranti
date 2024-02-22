import { style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

export const buttonIconClasses = {
  root: style({
    display: "flex",
    alignItems: "center",
    userSelect: "none",
    padding: 6,
    borderRadius: styleTokens.borderRadius,

    ":hover": {
      background: "color-mix(in srgb, var(--background-color-main), var(--opposite-color) 10%)",
      cursor: "pointer"
    },

    ":active": {
      background: "color-mix(in srgb, var(--background-color-main), var(--opposite-color) 7%)",
      cursor: "pointer"
    }
  }),

  icon: style({
    width: "15px",
    filter: styleTokens.iconColorFilter
  })
}
