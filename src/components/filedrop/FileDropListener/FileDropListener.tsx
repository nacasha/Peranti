import { appWindow } from "@tauri-apps/api/window"
import { type FC, useEffect } from "react"

import { fileDropStore } from "src/stores/fileDropStore.ts"

export const FileDropListener: FC = () => {
  const registerListener = async() => {
    const unlisten = await appWindow.onFileDropEvent((event) => {
      if (event.payload.type === "hover") {
        if (event.payload.paths.length === 0) {
          return
        }

        fileDropStore.setIsHovering(true)
        fileDropStore.setIsDroppingFile(false)
        fileDropStore.setDroppedFilePaths(event.payload.paths)
      } else if (event.payload.type === "drop") {
        if (event.payload.paths.length === 0) {
          return
        }

        fileDropStore.setIsHovering(false)
        fileDropStore.setIsDroppingFile(true)
        fileDropStore.setDroppedFilePaths(event.payload.paths)
      } else {
        fileDropStore.setIsHovering(false)
        fileDropStore.setIsDroppingFile(false)
        fileDropStore.setDroppedFilePaths([])
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

  return null
}
