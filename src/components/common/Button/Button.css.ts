import { style, globalStyle } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

export const buttonCss = style({
  border: "1px solid var(--button-border-color)",
  background: styleTokens.button.backgroundColor,
  borderRadius: styleTokens.border.radius,
  padding: "0 10px",
  userSelect: "none",
  cursor: "pointer",
  fontFamily: styleTokens.font.body,
  display: "flex",
  alignItems: "center",
  fontSize: styleTokens.font.size,
  height: "30px",
  color: "var(--text-color)",
  wordBreak: "keep-all",
  whiteSpace: "nowrap",
  ":hover": {
    borderColor: "var(--button-border-color-hover)",
    background: "var(--button-background-color-hover)"
  },

  ":active": {
    borderColor: "var(--button-border-color-active)",
    background: "var(--button-background-color-active)"
  }
})

globalStyle(`${buttonCss} img`, {
  width: "13px",
  marginRight: "7px",
  filter: "var(--icon-color)"
})
