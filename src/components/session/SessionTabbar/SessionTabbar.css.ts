import { globalStyle, style } from "@vanilla-extract/css"

import { appClasses } from "src/styles/app.css"
import { styleTokens } from "src/styles/styleTokens.css"

export const { ...sessionTabbarClasses } = new class {
  root = style({
    position: "relative",
    backgroundColor: "var(--session-tabbar-background-color)",
    minHeight: styleTokens.sessionTabbarHeight,
    height: styleTokens.sessionTabbarHeight
  })

  rootBorderBottom = style({
    position: "absolute",
    borderBottom: `1px solid ${styleTokens.borderColor}`,
    inset: 0
  })

  inner = style({
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

  innerSimplebar = style({
    width: "100%"
  })

  itemSession = style({
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

  itemSessionActive = style({})

  itemSessionBody = style({
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
      [`&${this.itemSessionActive}`]: {
        color: styleTokens.sessionTabbarTextColorActive,
        backgroundColor: styleTokens.appletViewerBackgroundColor,
        zIndex: 7,
        borderTop: "3px solid var(--accent-color)"
      }
    }
  })

  itemNew = style([this.itemSession, {
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

  itemSessionLabel = style({
    maxWidth: "var(--session-tabbar-item-max-width)",
    overflow: "hidden",

    selectors: {
      "&[contenteditable=\"false\"]": {
        textOverflow: "ellipsis"
      }
    }
  })

  itemSessionIcon = style({
    display: "flex",
    borderRadius: "var(--border-radius)",
    padding: "3px",
    opacity: "0",

    ":hover": {
      backgroundColor: "var(--button-background-color-hover)"
    },

    selectors: {
      [`${this.itemNew} &`]: {
        opacity: 1,
        paddingInline: 10,
        borderRadius: 0
      },
      [`${this.itemSession}:hover &`]: {
        opacity: 1
      }
    }
  })

  windowExtraDrag = style({
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

  constructor() {
    globalStyle(`${this.itemSessionIcon} img`, {
      width: "12px",
      filter: styleTokens.iconColorFilter
    })

    globalStyle(`${this.root} .simplebar-track.simplebar-horizontal`, {
      height: "5px",
      borderRadius: "0",
      pointerEvents: "all"
    })

    globalStyle(`${this.root} .simplebar-offset::after`, {
      content: " ",
      position: "absolute",
      left: "0",
      right: "0",
      bottom: "0",
      zIndex: 6
    })

    globalStyle(`${this.root} .simplebar-offset`, {
      display: "flex"
    })

    globalStyle(`${this.root} .simplebar-offset .simplebar-content-wrapper`, {
      flex: 1
    })

    globalStyle(`${this.root} .simplebar-content`, {
      display: "flex",
      height: "100%"
    })
  }
}()
