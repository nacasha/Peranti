import "@glideapps/glide-data-grid/dist/index.css"
import localforage from "localforage"
import { configurePersistable } from "mobx-persist-store"
import "rc-tooltip/assets/bootstrap_white.css"
import "react-contexify/ReactContexify.css"
import "reactflow/dist/style.css"
import "simplebar-react/dist/simplebar.min.css"

import "src/services/user-settings-service"
import "src/styles/root.scss"

/**
 * Use localforage to manage and persist application state,
 * behind the scene, localeforage will use IndexedDB
 */
configurePersistable({
  storage: localforage,
  stringify: false
})

/**
 * Replace default theme variables
 */
async function setupCustomTheme() {
  const el = document.querySelector("body")

  if (el) {
    // Set css variables
  }
}

void setupCustomTheme()
