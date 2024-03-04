import { globalStyle, style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

const root = style({
  margin: "0 5px",
  display: "flex",
  alignItems: "center",
  borderRadius: styleTokens.borderRadius,
  padding: "5px",
  height: styleTokens.activitybarItemHeight,
  position: "relative",

  "::before": {
    content: "",
    width: "2px",
    height: "70%",
    left: "-1px",
    backgroundColor: styleTokens.colorAccent,
    position: "absolute",
    opacity: "0",
    transition: `all ${styleTokens.animationSpeed}`
  },

  ":hover": {
    backgroundColor: styleTokens.activitybarItemBackgroundColorHover,
    cursor: "pointer"
  }
})

globalStyle(`${root} img`, {
  userSelect: "none",
  display: "flex",
  alignItems: "center",
  width: "21px",
  margin: "auto",
  filter: styleTokens.iconColorFilter
})

const rootActive = style({
  backgroundColor: styleTokens.activitybarItemBackgroundColorActive,

  "::before": {
    opacity: 1
  }
})

const tooltip = style({
  display: "none",
  position: "fixed",
  marginLeft: `calc(${styleTokens.activitybarWidth} - 3px)`,
  padding: "2px 5px",
  backgroundColor: styleTokens.activitybarBackgroundColor,
  color: styleTokens.textColor,
  borderRadius: styleTokens.borderRadius,
  whiteSpace: "nowrap",
  border: `1px solid ${styleTokens.borderColor}`,

  selectors: {
    [`${root}:hover &`]: {
      display: "block"
    }
  }
})

export const activitybarItemClasses = {
  root,
  rootActive,
  tooltip
}
