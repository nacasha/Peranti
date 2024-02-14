import { globalStyle, style } from "@vanilla-extract/css"

import { appClasses } from "src/styles/app.css"
import { styleTokens } from "src/styles/styleTokens.css"

const root = style({
  position: "relative",
  backgroundColor: "var(--session-tabbar-background-color)",
  minHeight: styleTokens.sessionTabbarHeight,
  height: styleTokens.sessionTabbarHeight
})

const rootBorderBottom = style({
  position: "absolute",
  borderBottom: `1px solid ${styleTokens.borderColor}`,
  inset: 0
})

const inner = style({
  display: "flex",
  position: "absolute",
  inset: "0",
  overflowX: "auto",
  overflowY: "hidden",
  zIndex: 1,

  selectors: {
    [`${appClasses.root}${appClasses.withTabbar} &`]: {
      right: `calc(${styleTokens.windowControlButtonWidth} * 5)`
    }
  }
})

const innerSimplebar = style({
  width: "100%"
})

const itemSession = style({
  display: "flex",
  height: styleTokens.sessionTabbarHeight,
  maxHeight: styleTokens.sessionTabbarHeight,
  borderRight: "1px solid var(--border-color)",
  position: "relative",

  ":hover": {
    backgroundColor: "var(--session-tabbar-color-hover)",
    cursor: "pointer"
  },

  "::after": {
    content: "",
    position: "absolute",
    borderBottom: `1px solid ${styleTokens.borderColor}`,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1
  },

  selectors: {
    "&:nth-last-child(2)": {
      borderRight: "none"
    },

    [`${appClasses.root}${appClasses.withTabbar}${appClasses.withNotMaximized} &::before`]: {
      borderTop: `1px solid ${styleTokens.borderColor}`
    }
  }
})

const itemSessionActive = style({})

const itemSessionBody = style({
  backgroundColor: "var(--session-tabbar-color)",
  padding: "5px 10px",
  paddingRight: "5px",
  paddingTop: "3px",
  userSelect: "none",
  color: "var(--session-tabbar-text-color)",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  borderTop: "2px solid transparent",
  whiteSpace: "nowrap",

  selectors: {
    [`${appClasses.root}${appClasses.withTabbar}${appClasses.withNotMaximized} &:not(${itemSessionActive})`]: {
    },

    [`&${itemSessionActive}`]: {
      color: "var(--session-tabbar-text-color-active)",
      backgroundColor: "var(--applet-header-background-color)",
      zIndex: 7,
      borderTop: "3px solid var(--accent-color)"
    }
  }
})

const itemNew = style([itemSession, {
  backgroundColor: "var(--session-tabbar-color)",
  position: "sticky",
  right: "0",
  borderLeft: "1px solid var(--border-color)",
  zIndex: 7,
  userSelect: "none",

  ":hover": {
    backgroundColor: "var(--session-tabbar-color-hover)",
    cursor: "pointer"
  }
}])

const itemSessionLabel = style({
  maxWidth: "var(--session-tabbar-item-max-width)",
  overflow: "hidden",

  selectors: {
    "&[contenteditable=\"false\"]": {
      textOverflow: "ellipsis"
    }
  }
})

const itemSessionIcon = style({
  display: "flex",
  borderRadius: "var(--border-radius)",
  padding: "3px",
  opacity: "0",

  ":hover": {
    backgroundColor: "var(--button-background-color-hover)"
  },

  selectors: {
    [`${itemNew} &`]: {
      opacity: 1,
      paddingInline: 10,
      borderRadius: 0
    },
    [`${itemSession}:hover &`]: {
      opacity: 1
    }
  }
})

globalStyle(`${itemSessionIcon} img`, {
  width: "12px",
  filter: styleTokens.iconColorFilter
})

const windowExtraDrag = style({
  backgroundColor: styleTokens.sessionTabbarBackgroundColor,

  selectors: {
    [`${appClasses.root}${appClasses.withTabbar}${appClasses.withNotMaximized} &`]: {
      height: styleTokens.sessionTabbarDraggableHeight
    },

    [`${appClasses.root}${appClasses.withTabbar}${appClasses.withMaximized} &`]: {
      height: 0
    }
  }
})

globalStyle(`${root} .simplebar-track.simplebar-horizontal`, {
  height: "5px",
  borderRadius: "0",
  pointerEvents: "all"
})

globalStyle(`${root} .simplebar-offset::after`, {
  content: " ",
  position: "absolute",
  left: "0",
  right: "0",
  bottom: "0",
  zIndex: 6
})

globalStyle(`${root} .simplebar-offset`, {
  display: "flex"
})

globalStyle(`${root} .simplebar-offset .simplebar-content-wrapper`, {
  flex: 1
})

globalStyle(`${root} .simplebar-content`, {
  display: "flex",
  height: "100%"
})

export const sessionTabbarClasses = {
  root,
  rootBorderBottom,
  inner,
  innerSimplebar,
  itemSession,
  itemSessionBody,
  itemSessionActive,
  itemSessionLabel,
  itemSessionIcon,
  itemNew,
  windowExtraDrag
}
