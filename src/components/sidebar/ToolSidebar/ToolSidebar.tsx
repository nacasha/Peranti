import { clsx } from "clsx"
import { observer } from "mobx-react"
import { useMemo, type FC } from "react"

import { AppSidebarContentItem } from "src/components/app/AppSidebarContentItem"
import { SidebarMode } from "src/enums/SidebarMode"
import { type Tool } from "src/models/Tool"
import { interfaceStore } from "src/stores/interfaceStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolSessionStore } from "src/stores/toolSessionStore"
import { toolStore } from "src/stores/toolStore"
import { type ToolConstructor } from "src/types/ToolConstructor"

import "./ToolSidebar.scss"

export const ToolSidebar: FC = observer(() => {
  // TODO: Configurable
  const groupToolsByCategory = true
  const sortToolAZ = true
  const sortCategoryAZ = true

  /**
   * All tools will be categorized as General by default
   */
  let listOfCategoriesAndTools: Record<string, ToolConstructor[]> = { General: [] }
  if (groupToolsByCategory) {
    listOfCategoriesAndTools = Object.fromEntries(toolStore.listOfTools.map((tool) => [tool.category, [] as Tool[]]))
  }

  /**
   * Put each tools on its category
   */
  toolStore.listOfTools.forEach((tool) => {
    if (groupToolsByCategory) {
      listOfCategoriesAndTools[tool.category].push(tool)
    } else {
      listOfCategoriesAndTools.General.push(tool)
    }
  })

  /**
   * Sort all tools by name
   */
  if (sortToolAZ) {
    listOfCategoriesAndTools = Object.fromEntries(
      Object.entries(listOfCategoriesAndTools).map(([category, tools]) => {
        return [category, tools.sort((a, b) => a.name < b.name ? -1 : 0)]
      })
    )
  }

  /**
   * Sort categories name
   */
  if (sortCategoryAZ) {
    listOfCategoriesAndTools = useMemo(() => Object.fromEntries(
      Object.entries(listOfCategoriesAndTools).sort(([categoryA], [categoryB]) => {
        return categoryA < categoryB ? -1 : 0
      })
    ), [])
  }

  const onClickSidebarItem = (tool: ToolConstructor) => () => {
    toolSessionStore.findOrCreateSession(tool)
    if (interfaceStore.sidebarMode === SidebarMode.FloatUnpinned) {
      interfaceStore.hideSidebar()
    }
  }

  return (
    <div className="ToolSidebar">
      {Object.entries(listOfCategoriesAndTools).map(([category, tools]) => (
        <div className="ToolSidebar-section" key={category}>
          <div className={clsx("ToolSidebar-section-title", groupToolsByCategory && "show")}>{category}</div>
          {tools.map((tool) => (
            <AppSidebarContentItem
              key={tool.toolId}
              active={toolRunnerStore.isToolActive(tool)}
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
