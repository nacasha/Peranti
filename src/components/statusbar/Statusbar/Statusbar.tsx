import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

import { StatusbarItemSendFeedback } from "../StatusbarItemSendFeedback"
import { StatusbarItemTheme } from "../StatusbarItemTheme"
import { StatusbarItemWordWrap } from "../StatusbarItemWordWrap"

import "./Statusbar.scss"

export const Statusbar = () => {
  const showStatusbar = useSelector(() => interfaceStore.showStatusbar)

  if (!showStatusbar) {
    return null
  }

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
