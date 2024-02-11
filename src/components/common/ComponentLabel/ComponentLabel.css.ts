import { style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

export const componentLabelCss = style({
  lineHeight: "1",
  marginBottom: styleTokens.inputOutputLabelSpacing,
  userSelect: "none",
  height: styleTokens.inputOutputLabelHeight,
  fontSize: styleTokens.fontSize,

  ":empty": {
    display: "none"
  }
})
