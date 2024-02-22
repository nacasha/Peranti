import { globalStyle, style } from "@vanilla-extract/css"

import { styleTokens } from "src/styles/styleTokens.css"
import { darkThemeClass } from "src/styles/themes/dark.theme.css"

export const { ...checkboxClasses } = new class {
  root = style({})
}()

globalStyle(`${darkThemeClass} ${checkboxClasses.root} .switch:not(:checked)`, {
  backgroundColor: styleTokens.buttonBackgroundColor
})
