import { clsx } from "clsx"
import { type ReactNode, type FC } from "react"

import { AppSidebarContentItem } from "src/components/app/AppSidebarContentItem"
import { Icons } from "src/constants/icons"
import { SidebarMode } from "src/enums/SidebarMode"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/stores/interfaceStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolSessionStore } from "src/stores/toolSessionStore"
import { toolStore } from "src/stores/toolStore"
import { type ToolConstructor } from "src/types/ToolConstructor"

import "./ToolSidebar.scss"

export const ToolSidebar: FC = () => {
  const listOfCategoriesAndTools = useSelector(() => toolStore.listOfCategoriesAndTools)
  const groupToolsByCategory = useSelector(() => toolStore.groupToolsByCategory)

  return (
    <div className="ToolSidebar">
      <div className="AppSidebarContent-title">Tools</div>
      {Object.entries(listOfCategoriesAndTools).map(([category, tools]) => (
        <div className="ToolSidebar-section" key={category}>
          <div className={clsx("ToolSidebar-section-title", groupToolsByCategory && "show")}>
            {category}
          </div>
          {tools.map((tool) => (
            <ToolSidebarItem
              key={tool.toolId}
              tool={tool}
            >
              {tool.name}
            </ToolSidebarItem>
          ))}
        </div>
      ))}
    </div>
  )
}

const ToolSidebarItem: FC<{ tool: ToolConstructor, children: ReactNode }> = ({ tool }) => {
  const isActive = useSelector(() => (
    toolRunnerStore.getActiveTool().toolId === tool.toolId
  ))

  const onClickSidebarItem = (tool: ToolConstructor) => () => {
    toolSessionStore.findOrCreateSession(tool)
    if (interfaceStore.sidebarMode === SidebarMode.FloatUnpinned) {
      interfaceStore.hideSidebar()
    }
  }

  return (
    <AppSidebarContentItem
      className="ToolSidebarItem"
      active={isActive}
      onClick={onClickSidebarItem(tool)}
    >
      <img src={Icons.Hash} alt="Hash" />
      <div>{tool.name}</div>
    </AppSidebarContentItem>
  )
}
