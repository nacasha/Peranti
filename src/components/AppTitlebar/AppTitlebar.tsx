import { type FC } from "react"

import { useWindowListener } from "src/hooks/useWindowListener"
import PanelLeftSVG from "src/assets/panel-left.svg"

import "./AppTitlebar.scss"
import { userInterfaceStore } from "src/store/userInterfaceStore"

export const AppTitlebar: FC = () => {
  useWindowListener()

  const onClickToggleSidebar = () => {
    userInterfaceStore.toggleSidebar()
  }

  return (
    <div className="AppTitlebar" data-tauri-drag-region>
      <div className="AppTitlebar-main">

        <div className="AppTitlebar-main-button" onClick={onClickToggleSidebar}>
          <img src={PanelLeftSVG} style={{ width: 15 }} alt="" />
        </div>

        <div className="AppTitlebar-main-title"></div>
      </div>
      <div className="AppTitlebar-control">
        <div className="titlebar-button" id="titlebar-minimize">
          <img
            src="https://api.iconify.design/mdi:window-minimize.svg"
            alt="minimize"
          />
        </div>
        <div className="titlebar-button" id="titlebar-maximize">
          <img
            src="https://api.iconify.design/mdi:window-maximize.svg"
            alt="maximize"
          />
        </div>
        <div className="titlebar-button" id="titlebar-close">
          <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
        </div>
      </div>
    </div>
  )
}
