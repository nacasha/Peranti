import { appWindow } from "@tauri-apps/api/window"
import { useEffect } from "react"

import { fileDropStore } from "src/stores/fileDropStore.ts"

export const withFileDropListener = (component: () => React.ReactNode) => () => {
  const registerListener = async() => {
    const unlisten = await appWindow.onFileDropEvent((event) => {
      if (event.payload.type === "hover") {
        if (event.payload.paths.length === 0) {
          return
        }

        fileDropStore.setIsHovering(true)
      } else if (event.payload.type === "drop") {
        if (event.payload.paths.length === 0) {
          return
        }

        fileDropStore.setIsHovering(false)
        fileDropStore.setDroppedFilePaths(event.payload.paths)
      } else {
        fileDropStore.setIsHovering(false)
      }
    })

    return unlisten
  }

  useEffect(() => {
    const registerFn = registerListener()

    return () => {
      void registerFn.then((unlisten) => { unlisten() })
    }
  }, [])

  return component()
}
