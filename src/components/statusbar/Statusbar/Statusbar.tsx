import { StatusbarItemSendFeedback } from "../StatusbarItemSendFeedback"
import { StatusbarItemTheme } from "../StatusbarItemTheme"
import { StatusbarItemWordWrap } from "../StatusbarItemWordWrap"

import "./Statusbar.scss"

export const Statusbar = () => {
  return (
    <div className="Statusbar">
      <div className="Statusbar-section">
        <div className="Statusbar-item">
          {__APP_VERSION__}
        </div>
      </div>

      <div className="Statusbar-section">
        <StatusbarItemTheme />
        <StatusbarItemWordWrap />
        <StatusbarItemSendFeedback />
      </div>
    </div>
  )
}
