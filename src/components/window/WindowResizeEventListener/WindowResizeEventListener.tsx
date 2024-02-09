import { appWindow } from "@tauri-apps/api/window"
import { type FC, useEffect } from "react"

import { interfaceStore } from "src/services/interface-store"

export const WindowResizeEventListener: FC = () => {
  const checkWindowMaximized = async() => {
    const isMaximized = await appWindow.isMaximized()
    interfaceStore.setIsWindowMaximized(isMaximized)
  }

  useEffect(() => {
    void checkWindowMaximized()

    const onResize = () => {
      interfaceStore.recalculateWindowSize()
      void checkWindowMaximized()
    }

    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return null
}
