import { AppRoot } from "./AppRoot.js"
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
import { Statusbar } from "./components/statusbar/Statusbar"
import { WindowResizeEventListener } from "./components/window/WindowResizeEventListener"
import { WindowSizeListener } from "./components/window/WindowSizeListener"

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

      <Statusbar />
    </AppRoot>
  )
}

export default AppMain
