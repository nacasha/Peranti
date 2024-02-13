import { style } from "@vanilla-extract/css"

import { styleTokens } from "./styleTokens.css"

export const appClasses = {
  root: style({
    margin: "0",
    padding: "0",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "100vw",
    height: "100vh",

    fontFamily: styleTokens.fontFamily,
    fontSize: styleTokens.fontSize,
    lineHeight: "24px",
    fontWeight: "400",

    fontSynthesis: "none",
    textRendering: "optimizeLegibility",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    WebkitTextSizeAdjust: "100%"
  }),

  withTabbar: style({}),

  withMaximized: style({}),

  withNotMaximized: style({}),

  withTextAreaWordWrap: style({}),

  container: style({
    display: "flex",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    backgroundColor: styleTokens.backgroundMain,
    position: "relative"
  }),

  content: style({
    width: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    backgroundColor: styleTokens.backgroundContent
  })
}
