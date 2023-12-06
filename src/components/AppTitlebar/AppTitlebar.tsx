import { FC } from "react";

import "./AppTitlebar.scss";
import { useWindowListener } from "../../hooks/useWindowListener";

import PanelLeftSVG from "../../assets/panel-left.svg"
import { rootStore } from "../../store/root-store";

export const AppTitlebar: FC = () => {
  useWindowListener();

  return (
    <div className="AppTitlebar" data-tauri-drag-region>
      <div className="AppTitlebar-main">

        <div className="AppTitlebar-main-button" onClick={rootStore.ui.set.toggleSidebar}>
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
  );
}
