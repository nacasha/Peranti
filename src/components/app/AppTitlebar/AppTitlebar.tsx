import { type FC } from "react"

import { ToolSearchBar } from "src/components/tools/ToolSearchBar/ToolSearchBar"
import { assets } from "src/constants/assets"
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
