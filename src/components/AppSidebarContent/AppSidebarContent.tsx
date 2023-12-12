import { observer } from "mobx-react"
import "./AppSidebarContent.scss"

import { toolStore } from "src/stores/toolStore"
import { listOfTools } from "src/tools"
import { interfaceStore } from "src/stores/interfaceStore"
import { AppSidebarItem } from "../AppSidebarItem"
import { type Tool } from "src/models/Tool"

export const AppSidebarContent = observer(() => {
  const { isSidebarHidden, sidebarMode } = interfaceStore

  const onClickSidebarItem = (tool: Tool) => () => {
    toolStore.openTool(tool)
    if (sidebarMode === "float-unpinned") {
      interfaceStore.hideSidebar()
    }
  }

  return (
    <div className={`AppSidebarContent ${sidebarMode}`.concat(isSidebarHidden ? " hidden" : "")}>
      <div className="icons"></div>
      <div>
        {listOfTools.map((tool) => (
          <AppSidebarItem
            key={tool.instanceId}
            active={toolStore.isToolActive(tool)}
            onClick={onClickSidebarItem(tool)}
          >
            {tool.name}
          </AppSidebarItem>
        ))}
      </div>
    </div>
  )
})
