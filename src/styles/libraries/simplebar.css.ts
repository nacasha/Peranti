import { globalStyle } from "@vanilla-extract/css"

import { darkThemeClass } from "../themes/dark.theme.css"
import { lightThemeClass } from "../themes/light.theme.css"

globalStyle(`${lightThemeClass} .simplebar-scrollbar:before`, {
  background: "rgba(0,0,0,0.5)"
})

globalStyle(`${darkThemeClass} .simplebar-scrollbar:before`, {
  background: "rgba(255,255,255,0.2)"
})
