import { type FC } from "react"

import { AppletSearchBar } from "src/components/applet/AppletSearchBar"
import { WindowControls } from "src/components/window/WindowControls"
import { AppTitleBarStyle } from "src/enums/app-titlebar-style"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

import "./AppTitlebar.scss"

export const AppTitlebar: FC = () => {
  const titlebarStyle = useSelector(() => interfaceStore.appTitlebarStyle)
  const showSessionTabbar = titlebarStyle === AppTitleBarStyle.Tabbar

  if (showSessionTabbar) {
    return null
  }

  return (
    <div className="AppTitlebar" data-tauri-drag-region>
      <div style={{ flex: 1, height: "100%" }} data-tauri-drag-region></div>

      {!showSessionTabbar && (
        <>
          <div />
          <AppletSearchBar />
        </>
      )}

      <WindowControls />
    </div>
  )
}
