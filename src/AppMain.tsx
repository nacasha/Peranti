import clsx from "clsx"
import { useEffect, type FC, type ReactNode } from "react"

import { ActivityBar } from "./components/activity-bar/ActivityBar"
import { AppStatusbar } from "./components/app/AppStatusbar"
import { AppThemeListener } from "./components/app/AppThemeListener/AppThemeListener.tsx"
import { AppTitlebar } from "./components/app/AppTitlebar"
import { AppletViewer } from "./components/applet/AppletViewer"
import { Commandbar } from "./components/commandbar/Commandbar/Commandbar.tsx"
import { FileDropArea } from "./components/filedrop/FileDropArea"
import { FileDropListener } from "./components/filedrop/FileDropListener"
import { NotificationProvider } from "./components/notification/NotificationProvider/NotificationProvider.tsx"
import { SessionTabbar } from "./components/session/SessionTabbar"
import { PrimarySidebar } from "./components/sidebar/PrimarySidebar"
import { WindowResizeEventListener } from "./components/window/WindowResizeEventListener"
import { WindowSizeListener } from "./components/window/WindowSizeListener"
import { AppTitleBarStyle } from "./enums/app-titlebar-style.ts"
import { useSelector } from "./hooks/useSelector.ts"
import { interfaceStore } from "./services/interface-store.ts"
import { appClasses } from "./styles/app.css.ts"

const AppRoot: FC<{ children: ReactNode }> = ({ children }) => {
  const titlebarStyle = useSelector(() => interfaceStore.appTitlebarStyle)
  const isWindowMaximized = useSelector(() => interfaceStore.isWindowMaximized)
  const textAreaWordWrap = useSelector(() => interfaceStore.textAreaWordWrap)

  const windowState = {
    WindowMaximized: isWindowMaximized,
    [appClasses.withMaximized]: isWindowMaximized,
    [appClasses.withNotMaximized]: !isWindowMaximized,
    TextAreaWordWrap: textAreaWordWrap,
    [appClasses.withTextAreaWordWrap]: textAreaWordWrap
  }

  const classNames = clsx(
    "AppRoot",
    appClasses.root,
    (titlebarStyle === AppTitleBarStyle.Tabbar) ? appClasses.withTabbar : null,
    windowState
  )

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
    <div className={classNames}>
      {children}
    </div>
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

      <AppTitlebar />

      <div className={appClasses.container}>
        <ActivityBar />
        <PrimarySidebar />

        <div className={appClasses.content}>
          <SessionTabbar />
          <AppletViewer />
        </div>
      </div>

      <AppStatusbar />
    </AppRoot>
  )
}

export default AppMain
