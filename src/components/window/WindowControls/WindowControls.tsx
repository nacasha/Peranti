import { memo, type FC } from "react"

import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons"
import { bottomPanelService } from "src/services/bottom-panel-service"
import { interfaceStore } from "src/services/interface-store"
import { secondarySidebarService } from "src/services/secondary-sidebar-service"
import { windowManager } from "src/services/window-manager"
import { isRunningInTauri } from "src/utils/is-running-in-tauri"

import "./WindowControls.scss"

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
    secondarySidebarService.toggle()
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
