import { type FC } from "react"

import { AppletSearchBar } from "src/components/applet/AppletSearchBar"
import { WindowControls } from "src/components/window/WindowControls"
import { AppTitleBarStyle } from "src/enums/app-titlebar-style"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

import { appTitlebarClasses } from "./AppTitlebar.css"

export const AppTitlebar: FC = () => {
  const titlebarStyle = useSelector(() => interfaceStore.appTitlebarStyle)
  const showSessionTabbar = titlebarStyle === AppTitleBarStyle.Tabbar

  if (showSessionTabbar) {
    return null
  }

  return (
    <div className={appTitlebarClasses.root} data-tauri-drag-region>
      <div />
      <AppletSearchBar />

      <div>
        <WindowControls />
      </div>
    </div>
  )
}
