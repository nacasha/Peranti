import { globalStyle, style } from "@vanilla-extract/css"

export const mermaidOutputClasses = {
  root: style({
    display: "flex",
    flexDirection: "column",
    flex: "1"
  }),

  inner: style({
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }),

  svg: style({
    minWidth: "100px",
    minHeight: "100px",
    maxHeight: "100px",
    maxWidth: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  })
}

globalStyle(`${mermaidOutputClasses.svg} svg`, {
  maxWidth: "100%",
  maxHeight: "100%",
  width: "fit-content",
  height: "auto"
})

globalStyle(".dmermaidSvgRenderer", {
  display: "none"
})
