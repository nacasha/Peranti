import { useEffect } from "react"

import { toolStore } from "src/stores/toolStore"

export const withAppBootstrap = (component: () => React.ReactNode) => () => {
  /**
   * Setup tools
   */
  void toolStore.setupTools()

  /**
   * Disable context menu on production
   */
  useEffect(() => {
    const disableContextMenu = () => {
      if (window.location.hostname !== "tauri.localhost") {
        return
      }

      document.addEventListener("contextmenu", e => {
        e.preventDefault()
        return false
      }, { capture: true })
    }

    disableContextMenu()
  }, [])

  return component()
}
