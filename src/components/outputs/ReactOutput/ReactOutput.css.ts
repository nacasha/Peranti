import { style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

export const reactOutputClasses = {
  root: style({
    display: "flex",
    flexDirection: "column",
    height: "100%"
  }),

  outputArea: style({
    border: `1px solid ${styleTokens.borderColor}`,
    borderRadius: styleTokens.borderRadius,
    height: "100%",
    flex: 1,
    backgroundColor: "#ffffff"
  }),

  outputContent: style({
    all: "unset",
    color: "initial"
  })
}
