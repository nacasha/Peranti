import { clsx } from "clsx"
import { type ReactNode, type FC } from "react"

import { Icons } from "src/constants/icons"
import { SidebarMode } from "src/enums/sidebar-mode"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { interfaceStore } from "src/services/interface-store"
import { sessionStore } from "src/services/session-store"
import { toolSidebarService } from "src/services/tool-sidebar-service"
import { type AppletConstructor } from "src/types/AppletConstructor"

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
              tool={applet}
            >
              {applet.name}
            </ToolSidebarInnerItem>
          ))}
        </div>
      ))}
    </div>
  )
}

const ToolSidebarInnerItem: FC<{ tool: AppletConstructor, children: ReactNode }> = ({ tool }) => {
  const isActive = useSelector(() => (
    activeAppletStore.getActiveApplet().appletId === tool.appletId &&
    !activeAppletStore.getActiveApplet().isDeleted
  ))

  const onClickSidebarItem = (tool: AppletConstructor) => () => {
    sessionStore.findOrCreateSession(tool)
    if (interfaceStore.sidebarMode === SidebarMode.FloatUnpinned) {
      interfaceStore.hideSidebar()
    }
  }

  return (
    <ToolSidebarItem
      className="ToolSidebarItem"
      active={isActive}
      onClick={onClickSidebarItem(tool)}
    >
      <img src={Icons.Hash} alt="Hash" />
      <div>{tool.name}</div>
    </ToolSidebarItem>
  )
}
