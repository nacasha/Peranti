import { style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

const verticalButtonList = style({
  display: "flex",
  flexDirection: "column",
  gap: "5px"
})

export const activityBarClasses = {
  root: style({
    width: "100%",
    maxWidth: styleTokens.activitybarWidth,
    overflow: "auto",
    backgroundColor: styleTokens.activitybarBackgroundColor,
    zIndex: "4",
    display: "flex",
    flexDirection: "column",
    paddingBlock: "5px",
    paddingLeft: "1px",
    borderRight: `1px solid ${styleTokens.borderColor}`
  }),

  topButtons: style([verticalButtonList, {
    flex: 1
  }]),

  bottomButtons: style([verticalButtonList])
}
