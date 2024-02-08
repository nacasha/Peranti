import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

import "./AppletSearchBar.scss"

export const AppletSearchBar = () => {
  const activeAppletName = useSelector(() => activeAppletStore.getActiveApplet().name)

  return (
    <div className="AppletSearchBar">
      <div className="left-padding"></div>
      <div className="AppletSearch">
        {activeAppletName}
      </div>
      <div className="right-padding"></div>
    </div>
  )
}
