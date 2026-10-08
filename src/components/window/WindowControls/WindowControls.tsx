import { memo, type FC } from "react"

import { ClosedTabsButton } from "src/components/buttons/ClosedTabsButton"
import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons"
import { secondarySidebarService } from "src/services/secondary-sidebar-service"
import { windowManager } from "src/services/window-manager"
import { isMacOS } from "src/utils/get-os"
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

  return (
    <div className="WindowControls" data-tauri-drag-region>
      <div className="WindowControls-layout-controls">
        <ClosedTabsButton />
        <ButtonIcon
          tooltip="Toggle Secondary Sidebar"
          onClick={handleClickPanelRight}
          icon={Icons.PanelRight}
        />
      </div>
      {isRunningInTauri && !isMacOS && (
        <div className="WindowControls-window-controls">
          <div
            className="WindowControls-button"
            onClick={handleClickMinimize}
          >
            <Icons.Minimize size={14} aria-label="Minimize" />
          </div>
          <div
            className="WindowControls-button"
            onClick={handleClickMaximize}
          >
            <Icons.Box size={12} aria-label="Maximize" />
          </div>
          <div
            className="WindowControls-button WindowControls-button--close"
            onClick={handleClickClose}
          >
            <Icons.Close size={15} aria-label="Close" />
          </div>
        </div>
      )}
    </div>
  )
}, () => true)
