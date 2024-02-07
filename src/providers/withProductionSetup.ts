import { useEffect } from "react"

export const withProductionSetup = (component: () => React.ReactNode) => () => {
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
