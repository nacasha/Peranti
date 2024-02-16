import { style, globalStyle } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

export const buttonClasses = {
  root: style({
    border: "1px solid var(--button-border-color)",
    background: styleTokens.buttonBackgroundColor,
    borderRadius: styleTokens.borderRadius,
    padding: "7px 11px",
    userSelect: "none",
    cursor: "pointer",
    fontFamily: styleTokens.fontFamily,
    display: "flex",
    alignItems: "center",
    fontSize: styleTokens.fontSize,
    color: styleTokens.textColor,
    wordBreak: "keep-all",
    whiteSpace: "nowrap",
    gap: 7,
    lineHeight: "1.35",

    ":hover": {
      borderColor: styleTokens.buttonBorderColorHover,
      background: styleTokens.buttonBackgroundColorHover
    },

    ":active": {
      borderColor: styleTokens.buttonBorderColorActive,
      background: styleTokens.buttonBackgroundColorActive
    }
  }),

  active: style({
    borderColor: styleTokens.colorAccent,

    ":hover": {
      borderColor: styleTokens.colorAccent
    }
  })
}

globalStyle(`${buttonClasses.root} img`, {
  width: "14px",
  filter: styleTokens.iconColorFilter
})
