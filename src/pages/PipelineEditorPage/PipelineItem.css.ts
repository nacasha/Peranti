import { globalStyle, style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

export const pipelineItemClasses = {
  root: style({
    border: `1px solid ${styleTokens.inputOutputBorderColor}`,
    width: 230,
    backgroundColor: styleTokens.inputOutputBackgroundColor,
    borderRadius: styleTokens.borderRadius
  }),

  title: style({
    borderBottom: `1px solid ${styleTokens.inputOutputBorderColor}`,
    padding: "10px 15px"
  }),

  handles: style({
    display: "flex",
    justifyContent: "space-between",
    position: "relative",
    marginTop: 10
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
