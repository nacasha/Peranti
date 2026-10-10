import { type FC, useEffect } from "react"

import { fileDropService } from "src/services/file-drop-service"
import { windowManager } from "src/services/window-manager"
import { getFileDropZoneAtPoint } from "src/utils/get-file-drop-zone-at-point"

/**
 * Tauri reports positions in physical pixels, the DOM hit-test wants CSS ones.
 */
const updateHoveredZone = (position: { x: number, y: number }) => {
  const scale = window.devicePixelRatio || 1

  fileDropService.setHoveredZone(getFileDropZoneAtPoint(position.x / scale, position.y / scale))
}

export const FileDropListener: FC = () => {
  const registerListener = async() => {
    const unlisten = await windowManager.onFileDropEvent((event) => {
      // "over" fires continuously while dragging but carries no paths, so the
      // hovering state set by "enter" is only refreshed with the new zone.
      if (event.payload.type === "over") {
        updateHoveredZone(event.payload.position)
        return
      }

      if (event.payload.type === "enter") {
        if (event.payload.paths.length === 0) {
          return
        }

        fileDropService.setIsHovering(true)
        fileDropService.setIsDroppingFile(false)
        fileDropService.setDroppedFilePaths(event.payload.paths)
        updateHoveredZone(event.payload.position)
      } else if (event.payload.type === "drop") {
        if (event.payload.paths.length === 0) {
          return
        }

        // The zone is resolved before the hovering state ends, since the
        // drop zones unmount together with it.
        updateHoveredZone(event.payload.position)
        fileDropService.setIsHovering(false)
        fileDropService.setIsDroppingFile(true)
        fileDropService.setDroppedFilePaths(event.payload.paths)
      } else {
        fileDropService.setIsHovering(false)
        fileDropService.setIsDroppingFile(false)
        fileDropService.setDroppedFilePaths([])
        fileDropService.setHoveredZone(undefined)
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
