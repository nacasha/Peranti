import { memo, type FC } from "react"

import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons"
import { appletSidebarService } from "src/services/applet-sidebar-service"
import { bottomPanelService } from "src/services/bottom-panel-service"
import { interfaceStore } from "src/services/interface-store"
import { windowManager } from "src/services/window-manager"

import { windowControlsClasses } from "./WindowControls.css"

export const WindowControls: FC = memo(() => {
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

  const handleClickPanelBottom = () => {
    bottomPanelService.toggleIsOpen()
  }

  return (
    <div className={windowControlsClasses.root} data-tauri-drag-region>
      <div className={windowControlsClasses.layoutControls}>
        <ButtonIcon
          tooltip="Toggle Primary Sidebar"
          onClick={handleClickPanelLeft}
          icon={Icons.PanelLeft}
        />
        <ButtonIcon
          tooltip="Toggle Bottom Panel"
          onClick={handleClickPanelBottom}
          icon={Icons.PanelBottom}
        />
        <ButtonIcon
          tooltip="Toggle Secondary Sidebar"
          onClick={handleClickPanelRight}
          icon={Icons.PanelRight}
        />
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
}, () => true)
