import { type FC } from "react"

import { SecondarySidebarSection } from "src/components/sidebar/SecondarySidebar"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

import "./AppletInfo.scss"

export const AppletInfo: FC = () => {
  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())

  return (
    <SecondarySidebarSection title="Info">
      <div className="AppletInfo">
        <div className="AppletInfo-item">
          <div className="AppletInfo-item-title">Name</div>
          <div className="AppletInfo-item-content">{activeApplet.name}</div>
        </div>
        <div className="AppletInfo-item">
          <div className="AppletInfo-item-title">Description</div>
          <div className="AppletInfo-item-content">{activeApplet.description ?? "-"}</div>
        </div>
        <div className="AppletInfo-item">
          <div className="AppletInfo-item-title">Category</div>
          <div className="AppletInfo-item-content">{activeApplet.category}</div>
        </div>
        <div className="AppletInfo-item">
          <div className="AppletInfo-item-title">Type</div>
          <div className="AppletInfo-item-content">{activeApplet.type}</div>
        </div>
      </div>
    </SecondarySidebarSection>
  )
}
