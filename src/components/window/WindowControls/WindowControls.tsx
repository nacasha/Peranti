import { type FC } from "react"

import { Icons } from "src/constants/icons"
import { windowManager } from "src/services/windowManager"

import "./WindowControls.scss"

export const WindowControls: FC = () => {
  const handleClickMinimize = () => {
    void windowManager.minimize()
  }
  const handleClickMaximize = () => {
    void windowManager.toggleMaximize()
  }
  const handleClickClose = () => {
    void windowManager.close()
  }

  return (
    <div className="WindowControls">
      <div
        className="WindowControls-button"
        onClick={handleClickMinimize}
      >
        <img src={Icons.Minimize} alt="Minimize" />
      </div>
      <div
        className="WindowControls-button"
        onClick={handleClickMaximize}
      >
        <img src={Icons.Box} alt="Maximize" />
      </div>
      <div
        className="WindowControls-button"
        onClick={handleClickClose}
      >
        <img src={Icons.Close} alt="Close" />
      </div>
    </div>
  )
}
