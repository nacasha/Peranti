import { style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

export const bottomPanelClasses = {
  root: style({
    borderTop: `1px solid ${styleTokens.borderColor}`,
    backgroundColor: styleTokens.bottomPanelBackgroundColor
  }),

  header: style({
    padding: "5px 10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${styleTokens.borderColor}`
  }),

  title: style({}),

  closeIconImg: style({
    width: 13,
    filter: styleTokens.iconColorFilter
  }),

  content: style({
    height: 250,
    overflow: "auto"
  })
}
