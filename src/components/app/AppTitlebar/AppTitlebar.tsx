import { type FC } from "react"

import { ToolSearchBar } from "src/components/tools/ToolSearchBar/ToolSearchBar"
import { Icons } from "src/constants/icons"
import { useWindowListener } from "src/hooks/useWindowListener"

import "./AppTitlebar.scss"

export const AppTitlebar: FC = () => {
  useWindowListener()

  return (
    <div className="AppTitlebar" data-tauri-drag-region>
      <div className="AppTitlebar-main"></div>

      <ToolSearchBar />

      <div className="AppTitlebar-control">
        <div className="titlebar-button" id="titlebar-minimize">
          <img
            src={Icons.Minimize}
            alt="minimize"
          />
        </div>
        <div className="titlebar-button" id="titlebar-maximize">
          <img
            src={Icons.Box}
            alt="maximize"
          />
        </div>
        <div className="titlebar-button" id="titlebar-close">
          <img
            src={Icons.Close}
            alt="close"
          />
        </div>
      </div>
    </div>
  )
}
