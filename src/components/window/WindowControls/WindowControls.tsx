import { type FC } from "react"

import { Icons } from "src/constants/icons"
import { appletSidebarService } from "src/services/applet-sidebar-service"
import { interfaceStore } from "src/services/interface-store"
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

  const handleClickPanelRight = () => {
    appletSidebarService.toggle()
  }

  const handleClickPanelLeft = () => {
    interfaceStore.toggleSidebar()
  }

  return (
    <div className={windowControlsClasses.root} data-tauri-drag-region>
      <div className={windowControlsClasses.layoutControls}>
        <div onClick={handleClickPanelLeft} className={windowControlsClasses.layoutControlsItem}>
          <img src={Icons.PanelLeft} />
        </div>
        <div onClick={handleClickPanelRight} className={windowControlsClasses.layoutControlsItem}>
          <img src={Icons.PanelRight} />
        </div>
      </div>
      <div className={windowControlsClasses.windowControls}>
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
    </div>
  )
}
