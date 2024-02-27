import { globalStyle, style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

export const pipelineItemClasses = {
  root: style({
    border: `1px solid ${styleTokens.inputOutputBorderColor}`,
    width: 280,
    backgroundColor: styleTokens.inputOutputBackgroundColor,
    borderRadius: styleTokens.borderRadius
  }),

  header: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${styleTokens.inputOutputBorderColor}`,
    padding: "10px 15px"
  }),

  headerTitle: style({
    display: "flex"
  }),

  headerAction: style({
    display: "flex"
  }),

  body: style({
    paddingBlock: 10
  }),

  bodyInner: style({
    position: "relative",
    display: "flex",
    justifyContent: "space-between"
  }),

  handlesLeft: style({
    textAlign: "left"
  }),

  handlesRight: style({
    textAlign: "right"
  })
}

globalStyle(`${pipelineItemClasses.handlesLeft} > div`, {
  position: "absolute"
})

globalStyle(`${pipelineItemClasses.handlesRight} > div`, {
  position: "absolute",
  right: 0
})

globalStyle(`${pipelineItemClasses.handlesLeft} label`, {
  paddingLeft: 15
})

globalStyle(`${pipelineItemClasses.handlesRight} label`, {
  paddingRight: 15
})

globalStyle(`${pipelineItemClasses.headerTitle} img`, {
  width: 15,
  marginRight: 10
})
