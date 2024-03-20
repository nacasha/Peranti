import { type FC } from "react"

import { SecondarySidebarSection } from "src/components/sidebar/SecondarySidebar"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

import "./AppletInfo.scss"

export const AppletInfo: FC = () => {
  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())

  if (activeApplet.appletId === "") {
    return null
  }

  return (
    <SecondarySidebarSection title="Information">
      <div className="AppletInfo">
        <Item label="Name" content={activeApplet.name} />
        <Item label="Description" content={activeApplet.description} />
      </div>
    </SecondarySidebarSection>
  )
}

const Item: FC<{ label: string, content: string }> = ({ content, label }) => {
  if (content.trim().length === 0) {
    return null
  }

  return (
    <div className="AppletInfo-item">
      <div className="AppletInfo-item-title">{label}</div>
      <div className="AppletInfo-item-content">{content}</div>
    </div>
  )
}
