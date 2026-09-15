import { type FC } from "react"

import { AppletSearchBar } from "src/components/applet/AppletSearchBar"
import { MacOSTrafficLights } from "src/components/window/MacOSTrafficLights"
import { WindowControls } from "src/components/window/WindowControls"
import { AppTitleBarStyle } from "src/enums/app-titlebar-style"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"
import { isMacOS } from "src/utils/get-os"
import { isRunningInTauri } from "src/utils/is-running-in-tauri"

import "./AppTitlebar.scss"

export const AppTitlebar: FC = () => {
  const titlebarStyle = useSelector(() => interfaceStore.appTitlebarStyle)
  const showSessionTabbar = titlebarStyle === AppTitleBarStyle.Tabbar

  if (showSessionTabbar) {
    if (isMacOS && isRunningInTauri) {
      return <MacOSTrafficLights className="AppTitlebar-macos-overlay" />
    }
    return null
  }

  return (
    <div className="AppTitlebar" data-tauri-drag-region>
      {isMacOS && isRunningInTauri ? (
        <MacOSTrafficLights />
      ) : (
        <div />
      )}
      <AppletSearchBar />
      <WindowControls />
    </div>
  )
}
