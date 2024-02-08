import clsx from "clsx"
import { type FC, type ReactNode } from "react"

import { ActivityBar } from "./components/activity-bar/ActivityBar"
import { AppStatusbar } from "./components/app/AppStatusbar"
import { AppThemeListener } from "./components/app/AppThemeListener/AppThemeListener.tsx"
import { AppTitlebar } from "./components/app/AppTitlebar"
import { AppletViewer } from "./components/applet/AppletViewer"
import { Commandbar } from "./components/commandbar/Commandbar/Commandbar.tsx"
import { FileDropArea } from "./components/filedrop/FileDropArea"
import { FileDropListener } from "./components/filedrop/FileDropListener"
import { SessionTabbar } from "./components/session/SessionTabbar"
import { PrimarySidebar } from "./components/sidebar/PrimarySidebar"
import { WindowResizeEventListener } from "./components/window/WindowResizeEventListener"
import { WindowSizeListener } from "./components/window/WindowSizeListener"
import { useSelector } from "./hooks/useSelector.ts"
import { interfaceStore } from "./services/interface-store.ts"

const AppRoot: FC<{ children: ReactNode }> = ({ children }) => {
  const titlebarStyle = useSelector(() => interfaceStore.appTitlebarStyle)
  const isWindowMaximized = useSelector(() => interfaceStore.isWindowMaximized)
  const textAreaWordWrap = useSelector(() => interfaceStore.textAreaWordWrap)

  const windowState = {
    WindowMaximized: isWindowMaximized,
    TextAreaWordWrap: textAreaWordWrap
  }

  return (
    <div className={clsx("AppRoot", titlebarStyle, windowState)}>
      {children}
    </div>
  )
}

export const AppMain = () => {
  return (
    <AppRoot>
      <AppThemeListener />
      <Commandbar />

      <WindowResizeEventListener />
      <WindowSizeListener />

      <FileDropArea />
      <FileDropListener />

      <AppTitlebar />

      <div className="AppContainer">
        <ActivityBar />
        <PrimarySidebar />

        <div className="AppContent">
          <SessionTabbar />
          <AppletViewer />
        </div>
      </div>

      <AppStatusbar />
    </AppRoot>
  )
}

export default AppMain
