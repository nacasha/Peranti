import { observer } from "mobx-react"
import "./AppSidebar.scss"

import { toolStore } from "src/store/toolStore"
import { type Tool } from "src/models/Tool"
import { listOfTools } from "src/tools"
import { userInterfaceStore } from "src/store/userInterfaceStore"

const AppSidebarItem = observer(({ tool }: { tool: Tool }) => {
  return (
    <div
      key={tool.name}
      className={"AppSidebar-item".concat(toolStore.isToolActive(tool) ? " active" : "")}
      onClick={() => { toolStore.openTool(tool) }}
    >
      {tool.name}
    </div>
  )
})

export const AppSidebar = observer(() => {
  const { isSidebarHidden } = userInterfaceStore

  return (
    <div className={"AppSidebar".concat(isSidebarHidden ? " hidden" : "")}>
      {listOfTools.map((tool) => <AppSidebarItem key={tool.instanceId} tool={tool} />)}
    </div>
  )
})
