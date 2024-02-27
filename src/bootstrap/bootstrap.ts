import { setElementVars } from "@vanilla-extract/dynamic"
import localforage from "localforage"
import { configurePersistable } from "mobx-persist-store"
import "rc-tooltip/assets/bootstrap_white.css"
import "react-contexify/ReactContexify.css"
import "reactflow/dist/style.css"
import "simplebar-react/dist/simplebar.min.css"

import "src/services/user-settings-service"
import "src/styles/fonts/inter-font.scss"
import "src/styles/globals.css"
import "src/styles/libraries/context-menu.css"
import "src/styles/libraries/notifications.css"
import "src/styles/libraries/simplebar.css"
import "src/styles/libraries/tooltip.scss"
import { styleTokens } from "src/styles/styleTokens.css"

configurePersistable({
  storage: localforage,
  stringify: false
})

async function setupCustomTheme() {
  const el = document.querySelector("body")

  if (el) {
    setElementVars(el, styleTokens, {
    })
  }
}

void setupCustomTheme()
