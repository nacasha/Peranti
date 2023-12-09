import { type FC } from "react"

import { useWindowListener } from "src/hooks/useWindowListener"
import { userInterfaceStore } from "src/store/userInterfaceStore"
import { assets } from "src/constants/assets"

import "./AppTitlebar.scss"
import { AppTitlebarSearch } from "./AppTitlebarSearch"

export const AppTitlebar: FC = () => {
  useWindowListener()

  const onClickToggleSidebar = () => {
    userInterfaceStore.toggleSidebar()
  }

  return (
    <div className="AppTitlebar" data-tauri-drag-region>
      <div className="AppTitlebar-main">
        <div className="AppTitlebar-main-button" onClick={onClickToggleSidebar}>
          <img src={assets.PanelLeftSVG} style={{ width: 15 }} alt="" />
        </div>
      </div>

      <AppTitlebarSearch />

      <div className="AppTitlebar-control">
        <div className="titlebar-button" id="titlebar-minimize">
          <img
            src={assets.MinimizeSVG}
            alt="minimize"
          />
        </div>
        <div className="titlebar-button" id="titlebar-maximize">
          <img
            src={assets.BoxSVG}
            alt="maximize"
          />
        </div>
        <div className="titlebar-button" id="titlebar-close">
          <img
            src={assets.CloseSVG}
            alt="close"
          />
        </div>
      </div>
    </div>
  )
}
