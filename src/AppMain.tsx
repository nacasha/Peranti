import NiceModal from "@ebay/nice-modal-react"
import clsx from "clsx"
import { useEffect, type FC, type ReactNode } from "react"

import { AppThemeListener } from "./components/app/AppThemeListener"
import { AppTitlebar } from "./components/app/AppTitlebar"
import { AppletViewer } from "./components/applet/AppletViewer"
import { Commandbar } from "./components/commandbar/Commandbar"
import { FileDropArea } from "./components/filedrop/FileDropArea"
import { FileDropListener } from "./components/filedrop/FileDropListener"
import { HotkeysListener } from "./components/hotkeys/HotkeysListener"
import { NotificationProvider } from "./components/notification/NotificationProvider"
import { SessionTabbar } from "./components/session/SessionTabbar"
import { PrimarySidebar } from "./components/sidebar/PrimarySidebar"
import { SecondarySidebarCommandbar } from "./components/sidebar/SecondarySidebar"
import { WindowResizeEventListener } from "./components/window/WindowResizeEventListener"
import { WindowSizeListener } from "./components/window/WindowSizeListener"
import { AppTitleBarStyle } from "./enums/app-titlebar-style.ts"
import { useSelector } from "./hooks/useSelector.ts"
import { interfaceStore } from "./services/interface-store.ts"

const AppRoot: FC<{ children: ReactNode }> = ({ children }) => {
  const titlebarStyle = useSelector(() => interfaceStore.appTitlebarStyle)
  const isWindowMaximized = useSelector(() => interfaceStore.isWindowMaximized)
  const textAreaWordWrap = useSelector(() => interfaceStore.textAreaWordWrap)

  const classNames = clsx("AppRoot", {
    WindowMaximized: isWindowMaximized,
    TextAreaWordWrap: textAreaWordWrap,
    withMaximized: isWindowMaximized,
    withNotMaximized: !isWindowMaximized,
    withTextAreaWordWrap: textAreaWordWrap,
    withTabbar: titlebarStyle === AppTitleBarStyle.Tabbar
  })

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

  return (
    <NiceModal.Provider>
      <div className={classNames}>
        {children}
      </div>
    </NiceModal.Provider>
  )
}

export const AppMain = () => {
  return (
    <AppRoot>
      <NotificationProvider />

      <AppThemeListener />
      <Commandbar />

      <WindowResizeEventListener />
      <WindowSizeListener />

      <FileDropArea />
      <FileDropListener />

      <HotkeysListener />

      <AppTitlebar />

      <div className="AppContainer">
        <PrimarySidebar />

        <div className="AppContent">
          <SessionTabbar />
          <AppletViewer />
        </div>

        <SecondarySidebarCommandbar />
      </div>
    </AppRoot>
  )
}

export default AppMain
