import { clsx } from "clsx"
import { type ReactNode, type FC } from "react"

import { Icons } from "src/constants/icons"
import { SidebarMode } from "src/enums/sidebar-mode"
import { useSelector } from "src/hooks/useSelector"
import { type AppletConstructor } from "src/models/AppletConstructor"
import { activeAppletStore } from "src/services/active-applet-store"
import { interfaceStore } from "src/services/interface-store"
import { sessionStore } from "src/services/session-store"
import { toolSidebarService } from "src/services/tool-sidebar-service"

import { ToolSidebarItem } from "../ToolSidebarItem"

import "./ToolSidebar.scss"

export const ToolSidebar: FC = () => {
  const groupByCategory = useSelector(() => toolSidebarService.groupByCategory)
  const items = useSelector(() => toolSidebarService.items)

  return (
    <div className="ToolSidebar">
      <div className="PrimarySidebar-title">Tools</div>
      {Object.entries(items).map(([category, applets]) => (
        <div className="ToolSidebar-section" key={category}>
          <div className={clsx("ToolSidebar-section-title", groupByCategory && "show")}>
            {category}
          </div>
          {applets.map((applet) => (
            <ToolSidebarInnerItem
              key={applet.appletId}
              appletConstructor={applet}
            >
              {applet.name}
            </ToolSidebarInnerItem>
          ))}
        </div>
      ))}
    </div>
  )
}

interface ToolSidebarInnerItemProps {
  appletConstructor: AppletConstructor
  children: ReactNode
}

const ToolSidebarInnerItem: FC<ToolSidebarInnerItemProps> = ({ appletConstructor }) => {
  const isActive = useSelector(() => (
    activeAppletStore.getActiveApplet().appletId === appletConstructor.appletId &&
    !activeAppletStore.getActiveApplet().isDeleted
  ))

  const onClickSidebarItem = (appletConstructor: AppletConstructor) => () => {
    sessionStore.findOrCreateSession(appletConstructor)
    if (interfaceStore.sidebarMode === SidebarMode.FloatUnpinned) {
      interfaceStore.hideSidebar()
    }
  }

  // const icons: Record<string, string> = {
  //   [AppletType.Extension]: Icons.Extension,
  //   [AppletType.Tool]: Icons.Tool,
  //   [AppletType.Pipeline]: Icons.Hash
  // }

  // const appletIcon = icons[appletConstructor.type ?? "Tool"] ?? Icons.Tool

  return (
    <ToolSidebarItem
      className="ToolSidebarItem"
      active={isActive}
      onClick={onClickSidebarItem(appletConstructor)}
    >
      <img src={Icons.Hash} alt={appletConstructor.name} />
      <div>{appletConstructor.name}</div>
    </ToolSidebarItem>
  )
}
