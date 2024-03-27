import { Icons } from "src/constants/icons"

import { StatusbarItemTheme } from "../StatusbarItemTheme"
import { StatusbarItemWordWrap } from "../StatusbarItemWordWrap"

import "./Statusbar.scss"

export const Statusbar = () => {
  return (
    <div className="Statusbar">
      <div className="Statusbar-section">
        <div className="Statusbar-item">
          v0.0.4
        </div>
      </div>

      <div className="Statusbar-section">
        <StatusbarItemTheme />
        <StatusbarItemWordWrap />
        <div className="Statusbar-item">
          <img src={Icons.History} alt="Theme" />
          Changelog
        </div>
        <div className="Statusbar-item">
          <img src={Icons.Feedback} alt="Theme" />
          Send Feedback
        </div>
      </div>
    </div>
  )
}
