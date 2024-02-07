import { useEffect } from "react"

export const withProductionSetup = (component: () => React.ReactNode) => () => {
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
