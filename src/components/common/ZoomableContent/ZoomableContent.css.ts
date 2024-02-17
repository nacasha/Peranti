import { createVar, globalStyle, style } from "@vanilla-extract/css"

import { darkThemeClass } from "src/styles/themes/dark.theme.css"

export const checkeredSize = createVar()
export const checkeredColor = createVar()
export const checkeredBackgroundColor = createVar()

export const { ...zoomableContentClasses } = new class {
  checkered = style({})

  root = style({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    height: "100%"
  })

  actions = style({
    display: "flex",
    gap: "5px",
    padding: "10px",
    position: "absolute",
    top: "0",
    zIndex: "1"
  })

  body = style({
    position: "relative",
    flex: "1"
  })

  content = style({
    position: "absolute",
    inset: "0",
    display: "flex",
    flexDirection: "column",
    border: "1px solid var(--input-output-border-color)",
    borderRadius: "var(--border-radius)",
    overflow: "hidden",
    background: "#ffffff",

    vars: {
      [checkeredSize]: "12px",
      [checkeredBackgroundColor]: "#ffffff",
      [checkeredColor]: "rgba(100, 100, 100, .25)"
    },

    selectors: {
      [`${darkThemeClass} &`]: {
        background: "#292a30",

        vars: {
          [checkeredBackgroundColor]: "#292a30"
        }
      },

      [`${this.checkered}&`]: {
        backgroundColor: checkeredBackgroundColor,
        backgroundImage: `
          linear-gradient(45deg, ${checkeredColor} 25%, transparent 25%),
          linear-gradient(135deg, ${checkeredColor} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${checkeredColor} 75%),
          linear-gradient(135deg, transparent 75%, ${checkeredColor} 75%)`,
        backgroundSize: `calc(2 * ${checkeredSize}) calc(2 * ${checkeredSize})`,
        backgroundPosition: `0 0, ${checkeredSize} 0, ${checkeredSize} calc(-1 * ${checkeredSize}), 0 calc(-1 * ${checkeredSize})`
      }
    }
  })
}()

globalStyle(`${zoomableContentClasses.root} .react-transform-wrapper`, {
  width: "100%",
  maxWidth: "100%",
  maxHeight: "100%",
  height: "100%",
  flex: "1"
})
