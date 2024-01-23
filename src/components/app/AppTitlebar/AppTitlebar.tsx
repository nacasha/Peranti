import { type FC } from "react"

import { ToolSearchBar } from "src/components/tools/ToolSearchBar/ToolSearchBar"
import { icons } from "src/constants/icons"
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
            src={icons.Minimize}
            alt="minimize"
          />
        </div>
        <div className="titlebar-button" id="titlebar-maximize">
          <img
            src={icons.Box}
            alt="maximize"
          />
        </div>
        <div className="titlebar-button" id="titlebar-close">
          <img
            src={icons.Close}
            alt="close"
          />
        </div>
      </div>
    </div>
  )
}
