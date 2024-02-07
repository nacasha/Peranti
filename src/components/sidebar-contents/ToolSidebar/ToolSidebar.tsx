import { clsx } from "clsx"
import { type ReactNode, type FC } from "react"

import { Icons } from "src/constants/icons"
import { SidebarMode } from "src/enums/SidebarMode"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/stores/interfaceStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { sessionStore } from "src/stores/sessionStore"
import { toolStore } from "src/stores/toolStore"
import { type ToolConstructor } from "src/types/ToolConstructor"

import { ToolSidebarItem } from "../ToolSidebarItem"

import "./ToolSidebar.scss"

export const ToolSidebar: FC = () => {
  const listOfCategoriesAndTools = useSelector(() => toolStore.listOfCategoriesAndTools)
  const groupToolsByCategory = useSelector(() => toolStore.groupToolsByCategory)

  return (
    <div className="ToolSidebar">
      <div className="PrimarySidebar-title">Tools</div>
      {Object.entries(listOfCategoriesAndTools).map(([category, tools]) => (
        <div className="ToolSidebar-section" key={category}>
          <div className={clsx("ToolSidebar-section-title", groupToolsByCategory && "show")}>
            {category}
          </div>
          {tools.map((tool) => (
            <ToolSidebarInnerItem
              key={tool.toolId}
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

const ToolSidebarInnerItem: FC<{ tool: ToolConstructor, children: ReactNode }> = ({ tool }) => {
  const isActive = useSelector(() => (
    toolRunnerStore.getActiveTool().toolId === tool.toolId &&
    !toolRunnerStore.getActiveTool().isDeleted
  ))

  const onClickSidebarItem = (tool: ToolConstructor) => () => {
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
