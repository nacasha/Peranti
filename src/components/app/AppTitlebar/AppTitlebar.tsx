import clsx from "clsx"
import { type FC } from "react"

import { ToolSearchBar } from "src/components/tools/ToolSearchBar"
import { WindowControls } from "src/components/window/WindowControls"
import { AppTitleBarStyle } from "src/enums/AppTitleBarStyle"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/stores/interfaceStore"

import "./AppTitlebar.scss"

export const AppTitlebar: FC = () => {
  const titlebarStyle = useSelector(() => interfaceStore.titlebarStyle)
  const onlyShowWindowControls = titlebarStyle === AppTitleBarStyle.Tabbar

  return (
    <div className={clsx("AppTitlebar", titlebarStyle)} data-tauri-drag-region>
      {!onlyShowWindowControls && (
        <>
          <div className="AppTitlebar-main"></div>
          <ToolSearchBar />
        </>
      )}

      <WindowControls />
    </div>
  )
}
