import { appWindow } from "@tauri-apps/api/window"
import { useEffect } from "react"

export function useWindowListener () {
  useEffect(() => {
    document.getElementById("titlebar-minimize")
      ?.addEventListener("click", () => { void appWindow.minimize() })
    document.getElementById("titlebar-maximize")
      ?.addEventListener("click", () => { void appWindow.toggleMaximize() })
    document.getElementById("titlebar-close")
      ?.addEventListener("click", () => { void appWindow.close() })
  }, [])
}
