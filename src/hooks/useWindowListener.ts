import { useEffect } from "react"

import { windowManager } from "src/services/windowManager"

export function useWindowListener() {
  useEffect(() => {
    document.getElementById("titlebar-minimize")
      ?.addEventListener("click", () => { void windowManager.minimize() })
    document.getElementById("titlebar-maximize")
      ?.addEventListener("click", () => { void windowManager.toggleMaximize() })
    document.getElementById("titlebar-close")
      ?.addEventListener("click", () => { void windowManager.close() })
  }, [])
}
