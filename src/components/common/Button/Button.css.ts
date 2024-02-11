import { style, globalStyle } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

export const buttonCss = style({
  border: "1px solid var(--button-border-color)",
  background: styleTokens.buttonBackgroundColor,
  borderRadius: styleTokens.borderRadius,
  padding: "0 10px",
  userSelect: "none",
  cursor: "pointer",
  fontFamily: styleTokens.fontFamily,
  display: "flex",
  alignItems: "center",
  fontSize: styleTokens.fontSize,
  height: "30px",
  color: styleTokens.textColor,
  wordBreak: "keep-all",
  whiteSpace: "nowrap",
  ":hover": {
    borderColor: styleTokens.buttonBorderColorHover,
    background: styleTokens.buttonBackgroundColorHover
  },

  ":active": {
    borderColor: styleTokens.buttonBorderColorActive,
    background: styleTokens.buttonBackgroundColorActive
  }
})

globalStyle(`${buttonCss} img`, {
  width: "13px",
  marginRight: "7px",
  filter: styleTokens.iconColorFilter
})
