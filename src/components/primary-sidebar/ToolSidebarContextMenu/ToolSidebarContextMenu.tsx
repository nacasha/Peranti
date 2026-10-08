import { type FC } from "react"
import { useContextMenu } from "react-contexify"
import { createPortal } from "react-dom"

import { ContextMenu, ContextMenuItem } from "src/components/common/ContextMenu"
import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { toolSidebarService } from "src/services/tool-sidebar-service"

/**
 * Context menu for the tool sidebar, opened by right-clicking it. Expands or
 * collapses every category group at once
 */
export const ToolSidebarContextMenu: FC = () => {
  const { hideAll } = useContextMenu({ id: ContextMenuKeys.ToolSidebar })
  const groupByCategory = useSelector(() => toolSidebarService.groupByCategory)

  // Read `items` inside the selectors: `useSelector` subscribes once on mount,
  // so a value captured from render would stay stale after the tools load
  const isAllExpanded = useSelector(() => (
    Object.keys(toolSidebarService.items).every((category) => !toolSidebarService.isCategoryCollapsed(category))
  ))
  const isAllCollapsed = useSelector(() => (
    Object.keys(toolSidebarService.items).every((category) => toolSidebarService.isCategoryCollapsed(category))
  ))

  const handleClickExpandAll = () => {
    toolSidebarService.expandAllCategories()
    hideAll()
  }

  const handleClickCollapseAll = () => {
    toolSidebarService.collapseAllCategories()
    hideAll()
  }

  /**
   * Portalled to the body: the sidebar's stacking context would otherwise
   * keep the menu under its scrollbar
   */
  return createPortal(
    <ContextMenu id={ContextMenuKeys.ToolSidebar}>
      <ContextMenuItem
        id="expand-all"
        icon={Icons.ExpandAll}
        disabled={!groupByCategory || isAllExpanded}
        onClick={handleClickExpandAll}
      >
        Expand All Groups
      </ContextMenuItem>
      <ContextMenuItem
        id="collapse-all"
        icon={Icons.CollapseAll}
        disabled={!groupByCategory || isAllCollapsed}
        onClick={handleClickCollapseAll}
      >
        Collapse All Groups
      </ContextMenuItem>
    </ContextMenu>,
    document.body
  )
}
