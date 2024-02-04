import { type FC } from "react"

import { ToolSearchBar } from "src/components/tools/ToolSearchBar"
import { WindowControls } from "src/components/window/WindowControls"

import "./AppTitlebar.scss"

export const AppTitlebar: FC = () => {
  return (
    <div className="AppTitlebar" data-tauri-drag-region>
      <div className="AppTitlebar-main"></div>

      <ToolSearchBar />
      <WindowControls />
    </div>
  )
}
