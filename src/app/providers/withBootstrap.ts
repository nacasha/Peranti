import localforage from "localforage"
import { configurePersistable } from "mobx-persist-store"
import "simplebar-react/dist/simplebar.min.css"

import { toolStore } from "src/stores/toolStore"

export const withBootstrap = (component: () => React.ReactNode) => () => {
  /**
   * Setup tools
   */
  void toolStore.setupTools()

  /**
   * Configure mobx persistable
   */
  configurePersistable({
    storage: localforage,

    /**
     * Disable stringify because we are using localforage
     */
    stringify: false
  })

  const disableContextMenu = () => {
    // if (window.location.hostname !== "tauri.localhost") {
    //   return
    // }

    document.addEventListener("contextmenu", e => {
      e.preventDefault()
      return false
    }, { capture: true })

    document.addEventListener("selectstart", e => {
      e.preventDefault()
      return false
    }, { capture: true })
  }

  disableContextMenu()

  return component()
}
