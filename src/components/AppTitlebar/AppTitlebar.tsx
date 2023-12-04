import { FC } from "react";

import { useWindowListener } from "../../hooks/useWindowListener";

interface AppTitlebar {
  title: string;
}

export const AppTitlebar: FC<AppTitlebar> = (props) => {
  const { title } = props;

  useWindowListener();

  return (
    <div className="app-titlebar" data-tauri-drag-region>
      <div className="app-titlebar-main">
        {title}
      </div>
      <div className="app-titlebar-control">
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
