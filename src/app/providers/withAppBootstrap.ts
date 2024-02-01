import { appWindow } from "@tauri-apps/api/window"
import { useEffect } from "react"

import { FileSystemManager } from "src/services/fileSystemManager"
import { toolStore } from "src/stores/toolStore"

export const withAppBootstrap = (component: () => React.ReactNode) => () => {
  /**
   * Setup tools
   */
  void toolStore.setupTools()

  useEffect(() => {
    /**
   * Disable context menu on production
   */
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

  const getFile = async(filePath: string) => {
    const result = await FileSystemManager.readFileAsText(filePath)
    console.log({ result })
  }

  useEffect((): any => {
    return async() => await appWindow.onFileDropEvent((event) => {
      if (event.payload.type === "hover") {
        console.log("User hovering", event.payload.paths)
      } else if (event.payload.type === "drop") {
        console.log("User dropped", event.payload.paths)
        if (event.payload.paths[0]) {
          void getFile(event.payload.paths[0])
        }
      } else {
        console.log("File drop cancelled")
      }
    })
  }, [])

  return component()
}
