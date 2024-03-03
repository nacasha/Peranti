import { style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

export const componentLabelCss = style({
  marginBottom: styleTokens.inputOutputLabelSpacing,
  userSelect: "none",
  fontSize: styleTokens.fontSize,

  ":empty": {
    display: "none"
  }
})
