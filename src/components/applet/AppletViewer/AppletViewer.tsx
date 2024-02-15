import { type FC } from "react"
import SimpleBar from "simplebar-react"

import { ActiveSessionStateListener } from "src/components/session/ActiveSessionStateListener"

import { AppletBatchModeHeader } from "../AppletBatchModeHeader"
import { AppletComponentArea } from "../AppletComponentArea"
import { AppletHeader } from "../AppletHeader"
import { AppletSidebar } from "../AppletSidebar"

import "./AppletViewer.scss"

export const AppletViewer: FC = () => {
  return (
    <div className="AppletViewer">
      <div className="AppletViewer-inner">
        <ActiveSessionStateListener />
        <AppletHeader />
        <AppletBatchModeHeader />

        <div style={{ display: "flex", flex: 1, overflow: "hidden", width: 0, minWidth: "100%" }}>
          <SimpleBar className="AppletViewer-main-panel">
            <AppletComponentArea />
          </SimpleBar>
          <AppletSidebar />
        </div>
      </div>
    </div>
  )
}
