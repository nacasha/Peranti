import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { commandbarService } from "src/services/commandbar-service"

import "./AppletSearchBar.scss"

export const AppletSearchBar = () => {
  const activeAppletName = useSelector(() => activeAppletStore.getActiveApplet().name)

  const handleClick = () => {
    commandbarService.open()
  }

  return (
    <div className="AppletSearchBar">
      <div className="left-padding"></div>
      <div className="AppletSearch" onClick={handleClick}>
        {activeAppletName || "Search tabs and tools"}
      </div>
      <div className="right-padding"></div>
    </div>
  )
}
