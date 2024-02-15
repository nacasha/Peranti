import { style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

const rootShow = style({})

const root = style({
  width: 250,
  marginRight: -250,
  borderLeft: `1px solid ${styleTokens.borderColor}`,
  transition: `all ${styleTokens.transitionSpeed}`,
  backgroundColor: styleTokens.secondaySidebarBackgroundColor,

  selectors: {
    [`${rootShow}&`]: {
      marginRight: 0
    }
  }
})

const inner = style({
  padding: 10,
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 10
})

export const appletSidebarClasses = {
  root,
  rootShow,
  inner
}
