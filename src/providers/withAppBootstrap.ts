import { appWindow } from "@tauri-apps/api/window"
import { useEffect } from "react"

import { fileDropStore } from "src/stores/fileDropStore"
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
  })

  useEffect((): any => {
    return async() => await appWindow.onFileDropEvent((event) => {
      if (event.payload.type === "hover") {
        fileDropStore.setIsDroppingFile(true)
      } else if (event.payload.type === "drop") {
        fileDropStore.setIsDroppingFile(false)
        fileDropStore.callListeners(event.payload.paths)
      } else {
        fileDropStore.setIsDroppingFile(false)
      }
    })
  }, [])

  return component()
}
