import { rootStore } from "src/store/root-store"
import { type Tool } from "src/types/Tool"
import "./AppSidebar.scss"

export const AppSidebar = () => {
  const tools = rootStore.tool.get.tools()
  const currentTool = rootStore.tool.use.currentToolOrEmpty()

  const onClickTool = (tool: Tool) => () => {
    rootStore.tool.set.currentTool(tool)
    rootStore.input.set.resetParams()
  }

  const isActive = (tool: Tool) => {
    return currentTool.title === tool.title
  }

  const isSidebarHidden = rootStore.ui.use.hiddenSidebar()

  return (
    <div className={"AppSidebar".concat(isSidebarHidden ? " hidden" : "")}>
      {tools.map((tool) => (
        <div
          key={tool.title}
          className={"AppSidebar-item".concat(isActive(tool) ? " active" : "")}
          onClick={onClickTool(tool)}
        >
          {tool.title}
        </div>
      ))}
    </div>
  )
}
