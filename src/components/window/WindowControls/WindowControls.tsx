import { memo, type FC } from "react"

import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons"
import { appletSidebarService } from "src/services/applet-sidebar-service"
import { bottomPanelService } from "src/services/bottom-panel-service"
import { interfaceStore } from "src/services/interface-store"
import { windowManager } from "src/services/window-manager"

import "./WindowControls.scss"

import { isRunningInTauri } from "src/utils/is-running-in-tauri"

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
    <div className="WindowControls" data-tauri-drag-region>
      <div className="WindowControls-layout-controls">
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
      {isRunningInTauri && (
        <div className="WindowControls-window-controls">
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
      )}
    </div>
  )
}, () => true)
