import { observer } from "mobx-react"
import { type FC } from "react"

import { AppSidebarContentItem } from "src/components/app/AppSidebarContentItem"
import { SidebarMode } from "src/enums/SidebarMode"
import { type Tool } from "src/models/Tool"
import { interfaceStore } from "src/stores/interfaceStore"
import { toolStore } from "src/stores/toolStore"
import { listOfTools } from "src/tools"

export const ToolSidebar: FC = observer(() => {
  const onClickSidebarItem = (tool: Tool) => () => {
    toolStore.openTool(tool)
    if (interfaceStore.sidebarMode === SidebarMode.FLOAT_UNPINNED) {
      interfaceStore.hideSidebar()
    }
  }

  return (
    <div>
      {listOfTools.map((tool) => (
        <AppSidebarContentItem
          key={tool.instanceId}
          active={toolStore.isToolActive(tool)}
          onClick={onClickSidebarItem(tool)}
        >
          {tool.name}
        </AppSidebarContentItem>
      ))}
    </div>
  )
})
