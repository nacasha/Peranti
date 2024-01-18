import { clsx } from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"

import { AppSidebarContentItem } from "src/components/app/AppSidebarContentItem"
import { SidebarMode } from "src/enums/SidebarMode"
import { interfaceStore } from "src/stores/interfaceStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolSessionStore } from "src/stores/toolSessionStore"
import { toolStore } from "src/stores/toolStore"
import { type ToolConstructor } from "src/types/ToolConstructor"

import "./ToolSidebar.scss"

export const ToolSidebar: FC = observer(() => {
  const { listOfCategoriesAndTools, groupToolsByCategory } = toolStore

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
