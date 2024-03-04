import { type FC, useEffect } from "react"

import { fileDropService } from "src/services/file-drop-service"
import { windowManager } from "src/services/window-manager"

export const FileDropListener: FC = () => {
  const registerListener = async() => {
    const unlisten = await windowManager.onFileDropEvent((event) => {
      if (event.payload.type === "hover") {
        if (event.payload.paths.length === 0) {
          return
        }

        fileDropService.setIsHovering(true)
        fileDropService.setIsDroppingFile(false)
        fileDropService.setDroppedFilePaths(event.payload.paths)
      } else if (event.payload.type === "drop") {
        if (event.payload.paths.length === 0) {
          return
        }

        fileDropService.setIsHovering(false)
        fileDropService.setIsDroppingFile(true)
        fileDropService.setDroppedFilePaths(event.payload.paths)
      } else {
        fileDropService.setIsHovering(false)
        fileDropService.setIsDroppingFile(false)
        fileDropService.setDroppedFilePaths([])
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
