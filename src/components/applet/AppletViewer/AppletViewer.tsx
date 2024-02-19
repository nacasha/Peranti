import { type FC } from "react"
import SimpleBar from "simplebar-react"

import { HomePage } from "src/applets/pages/welcome-applet"
import { BottomPanel } from "src/components/bottom-panel/BottomPanel"
import { ActiveSessionStateListener } from "src/components/session/ActiveSessionStateListener"
import { SecondarySidebarTabbar } from "src/components/sidebar/SecondarySidebar"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

import { AppletComponentArea } from "../AppletComponentArea"

import "./AppletViewer.scss"

export const AppletViewer: FC = () => {
  const showHomepage = useSelector(() => activeAppletStore.getActiveApplet().appletId === "")

  return (
    <div className="AppletViewer">
      <div className="AppletViewer-inner">
        <ActiveSessionStateListener />

        <div style={{ display: "flex", flex: 1, overflow: "hidden", width: 0, minWidth: "100%" }}>
          <SimpleBar className="AppletViewer-main-panel">
            {showHomepage ? <HomePage /> : <AppletComponentArea />}
          </SimpleBar>
        </div>

        <BottomPanel />
      </div>

      <SecondarySidebarTabbar />
    </div>
  )
}
