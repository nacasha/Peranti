import { clsx } from "clsx"
import { type ReactNode, type FC } from "react"

import { Icons } from "src/constants/icons"
import { SidebarMode } from "src/enums/sidebar-mode"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletStore } from "src/services/applet-store"
import { interfaceStore } from "src/services/interface-store"
import { sessionStore } from "src/services/session-store"
import { type AppletConstructor } from "src/types/AppletConstructor"

import { ToolSidebarItem } from "../ToolSidebarItem"

import "./ToolSidebar.scss"

export const ToolSidebar: FC = () => {
  const listOfCategoriesAndApplets = useSelector(() => appletStore.listOfCategoriesAndApplets)
  const groupByCategory = useSelector(() => appletStore.groupByCategory)

  return (
    <div className="ToolSidebar">
      <div className="PrimarySidebar-title">Tools</div>
      {Object.entries(listOfCategoriesAndApplets).map(([category, tools]) => (
        <div className="ToolSidebar-section" key={category}>
          <div className={clsx("ToolSidebar-section-title", groupByCategory && "show")}>
            {category}
          </div>
          {tools.map((tool) => (
            <ToolSidebarInnerItem
              key={tool.appletId}
              tool={tool}
            >
              {tool.name}
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
