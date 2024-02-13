import { type FC } from "react"

import { Icons } from "src/constants/icons"
import { windowManager } from "src/services/window-manager"

import { windowControlsClasses } from "./WindowControls.css"

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
    <div className={windowControlsClasses.root} data-tauri-drag-region>
      <div
        className={windowControlsClasses.button}
        onClick={handleClickMinimize}
      >
        <img src={Icons.Minimize} alt="Minimize" />
      </div>
      <div
        className={windowControlsClasses.button}
        onClick={handleClickMaximize}
      >
        <img src={Icons.Box} alt="Maximize" />
      </div>
      <div
        className={windowControlsClasses.button}
        onClick={handleClickClose}
      >
        <img src={Icons.Close} alt="Close" />
      </div>
    </div>
  )
}
