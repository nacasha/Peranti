import { observer } from "mobx-react"
import { rootStore } from "src/store/root-store"
import "./AppSidebar.scss"
import { toolStore } from "src/store/toolStore"
import { type Tool } from "src/models/Tool"
import { listOfTools } from "src/tools"
import { toolHistoryStore } from "src/store/toolHistoryStore"

const AppSidebarItem = observer(({ tool }: { tool: Tool }) => {
  return (
    <div
      key={tool.title}
      className={"AppSidebar-item".concat(toolStore.isToolActive(tool) ? " active" : "")}
      onClick={() => { toolStore.setActiveTool(tool) }}
    >
      {tool.title}
    </div>
  )
})

const AppSidebarHistory = observer(() => {
  return toolHistoryStore.history
    .map((tool) => <AppSidebarItem key={tool.id} tool={tool} />)
})

export const AppSidebar = () => {
  const isSidebarHidden = rootStore.ui.use.hiddenSidebar()

  return (
    <div className={"AppSidebar".concat(isSidebarHidden ? " hidden" : "")}>
      {listOfTools.map((tool) => <AppSidebarItem key={tool.id} tool={tool} />)}
      <div className="AppSidebar-history">
        <AppSidebarHistory />
      </div>
    </div>
  )
}
