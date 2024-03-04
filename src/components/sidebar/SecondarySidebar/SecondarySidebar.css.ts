import { globalStyle, style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"

export const { ...secondarySidebarClasses } = new class {
  rootShow = style({})

  root = style({
    width: 250,
    marginRight: -250,
    backgroundColor: styleTokens.secondaySidebarBackgroundColor,

    selectors: {
      [`${this.rootShow}&`]: {
        borderLeft: `1px solid ${styleTokens.borderColor}`,
        marginRight: 0
      }
    }
  })

  sectionExpanded = style({})

  section = style({
    overflow: "hidden",
    height: 33,
    borderTop: `1px solid ${styleTokens.borderColor}`,
    transition: `all ${styleTokens.animationSpeed}`,

    ":first-child": {
      borderTop: "none"
    },

    selectors: {
      [`${this.sectionExpanded}&`]: {
        height: "fit-content"
      }
    }
  })

  sectionHeader = style({
    display: "flex",
    alignItems: "center",
    gap: 5,
    lineHeight: 2,
    userSelect: "none",
    padding: "3px 8px",

    ":hover": {
      cursor: "pointer"
    },

    selectors: {
      [`${this.section}:nth-child(1) &`]: {
        borderTop: "none"
      }
    }
  })

  sectionTitle = style({
    display: "flex",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between"
  })

  sectionBody = style({
    display: "flex",
    flexDirection: "column",
    gap: 10
  })
}()

globalStyle(`${secondarySidebarClasses.sectionHeader} img`, {
  width: 12,
  filter: styleTokens.iconColorFilter
})
