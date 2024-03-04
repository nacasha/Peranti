import { globalStyle } from "@vanilla-extract/css"

import { darkThemeClass } from "../themes/dark.theme.css"
import { lightThemeClass } from "../themes/light.theme.css"

const parent = ".contexify"
const itemContent = ".contexify .contexify_itemContent"
const itemContentActive = (theme: string) => `
${theme} .contexify_item:not(.contexify_item-disabled):focus>.contexify_itemContent,
${theme} .contexify_item:not(.contexify_item-disabled):hover>.contexify_itemContent,
${theme} .contexify_submenu-isOpen,
${theme} .contexify_submenu-isOpen>.contexify_itemContent`

globalStyle(parent, {
  boxShadow: "0 0 7px -1px rgba(0, 0, 0, 0.1)",
  animationDuration: "var(--animation-speed)"
})

globalStyle(`${lightThemeClass} ${parent}`, {
  border: "1px solid #cacaca",
  backgroundColor: "#ffffff"
})

globalStyle(`${lightThemeClass} ${itemContent}`, {
  color: "#3b3b3b"
})

globalStyle(itemContentActive(lightThemeClass), {
  backgroundColor: "#e8e8e8",
  color: "#1d1d1d"
})

globalStyle(`${darkThemeClass} ${parent}`, {
  border: "1px solid #313131",
  backgroundColor: "#1e1f22"
})

globalStyle(`${darkThemeClass} ${itemContent}`, {
  color: "#e0e0e0"
})

globalStyle(itemContentActive(darkThemeClass), {
  backgroundColor: "#323232",
  color: "#ffffff"
})
