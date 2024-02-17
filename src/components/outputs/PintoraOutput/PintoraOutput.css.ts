import { style } from "@vanilla-extract/css"

export const pintoraOutputClasses = {
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

  output: style({
    display: "none"
  })
}
