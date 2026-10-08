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
      <div className="ToolSidebar-body">
        {Object.entries(items).map(([category, applets]) => (
          <ToolSidebarSection
            key={category}
            category={category}
            applets={applets}
            collapsible={groupByCategory}
          />
        ))}
      </div>
    </div>
  )
}

interface ToolSidebarSectionProps {
  category: string
  applets: AppletConstructor[]
  collapsible: boolean
}

const ToolSidebarSection: FC<ToolSidebarSectionProps> = ({ category, applets, collapsible }) => {
  const isCollapsed = useSelector(() => collapsible && toolSidebarService.isCategoryCollapsed(category))
  const showGroupTabCount = useSelector(() => toolSidebarService.showGroupTabCount)
  const groupTabCount = useSelector(() => applets.reduce(
    (total, applet) => total + sessionStore.countSessionsOfApplet(applet.appletId),
    0
  ))

  /**
   * A collapsed group still signals that it holds the open tool, so the
   * active tool is never lost from view
   */
  const hasActiveApplet = useSelector(() => {
    const activeApplet = activeAppletStore.getActiveApplet()
    return !activeApplet.isDeleted && applets.some((applet) => applet.appletId === activeApplet.appletId)
  })

  const bodyId = `ToolSidebar-section-${category}`

  const handleClickTitle = () => {
    toolSidebarService.toggleCategory(category)
  }

  return (
    <div className={clsx("ToolSidebar-section", { collapsible, collapsed: isCollapsed })}>
      {collapsible && (
        <button
          type="button"
          className="ToolSidebar-section-title"
          aria-expanded={!isCollapsed}
          aria-controls={bodyId}
          onClick={handleClickTitle}
        >
          <Icons.ChevronRight className="ToolSidebar-section-chevron" size={12} aria-hidden />
          <span className="ToolSidebar-section-name">{category}</span>
          {isCollapsed && hasActiveApplet && <span className="ToolSidebar-section-active-dot" />}
          {showGroupTabCount && groupTabCount > 0 && (
            <span className="ToolSidebar-section-count">{groupTabCount}</span>
          )}
        </button>
      )}

      {/* Grid rows animate between 0fr and 1fr, so the group slides to its
          natural height without measuring it */}
      <div id={bodyId} className="ToolSidebar-section-body" aria-hidden={isCollapsed}>
        <div className="ToolSidebar-section-items">
          {applets.map((applet) => (
            <ToolSidebarInnerItem
              key={applet.appletId}
              appletConstructor={applet}
            >
              {applet.name}
            </ToolSidebarInnerItem>
          ))}
        </div>
      </div>
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

  const showToolTabCount = useSelector(() => toolSidebarService.showToolTabCount)
  const toolTabCount = useSelector(() => sessionStore.countSessionsOfApplet(appletConstructor.appletId))

  const onClickSidebarItem = (appletConstructor: AppletConstructor) => () => {
    sessionStore.findOrCreateSession(appletConstructor)
    if (interfaceStore.sidebarMode === SidebarMode.FloatUnpinned) {
      interfaceStore.hideSidebar()
    }
  }

  return (
    <ToolSidebarItem
      className="ToolSidebarItem"
      active={isActive}
      onClick={onClickSidebarItem(appletConstructor)}
    >
      <div>{appletConstructor.name}</div>
      {showToolTabCount && toolTabCount > 0 && (
        <span className="ToolSidebarItem-count">{toolTabCount}</span>
      )}
    </ToolSidebarItem>
  )
}
