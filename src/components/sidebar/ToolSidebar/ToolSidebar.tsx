import { clsx } from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"

import { AppSidebarContentItem } from "src/components/app/AppSidebarContentItem"
import { SidebarMode } from "src/enums/SidebarMode"
import { type Tool } from "src/models/Tool"
import { interfaceStore } from "src/stores/interfaceStore"
import { toolStore } from "src/stores/toolStore"

import "./ToolSidebar.scss"

export const ToolSidebar: FC = observer(() => {
  // TODO: Configurable
  const showToolCategoryTitle = true
  const sortToolAZ = true

  const onClickSidebarItem = (tool: Tool) => () => {
    toolStore.openTool(tool)
    if (interfaceStore.sidebarMode === SidebarMode.FLOAT_UNPINNED) {
      interfaceStore.hideSidebar()
    }
  }

  let listOfCategoriesAndTools = Object.fromEntries(toolStore.listOfTools.map((tool) => [tool.category, [] as Tool[]]))
  toolStore.listOfTools.forEach((tool) => listOfCategoriesAndTools[tool.category].push(tool))

  if (sortToolAZ) {
    listOfCategoriesAndTools = Object.fromEntries(
      Object.entries(listOfCategoriesAndTools).map(([category, tools]) => {
        return [category, tools.sort((a, b) => a.name < b.name ? -1 : 0)]
      })
    )
  }

  return (
    <div className="ToolSidebar">
      {Object.entries(listOfCategoriesAndTools).map(([category, tools]) => (
        <div className="ToolSidebar-section" key={category}>
          <div className={clsx("ToolSidebar-section-title", showToolCategoryTitle && "show")}>{category}</div>
          {tools.map((tool) => (
            <AppSidebarContentItem
              key={tool.instanceId}
              active={toolStore.isToolActive(tool)}
              onClick={onClickSidebarItem(tool)}
            >
              {tool.name}
            </AppSidebarContentItem>
          ))}
        </div>
      ))}
    </div>
  )
})
