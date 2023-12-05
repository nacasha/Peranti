import { rootStore } from "../../store/root-store";
import { Tool } from "../../types/Tool";
import "./AppSidebar.scss"

export const AppSidebar = () => {
  const tools = rootStore.tool.get.tools();
  const currentTool = rootStore.tool.use.currentToolOrEmpty()

  const onClickTool = (tool: Tool) => () => {
    rootStore.tool.set.currentTool(tool)
    rootStore.input.set.resetParams()
  }

  const isActive = (tool: Tool) => {
    return currentTool.title === tool.title
  }

  return (
    <div className="AppSidebar">
      {tools.map((tool) => (
        <div
          key={tool.title}
          className={"AppSidebar-item ".concat(isActive(tool) ? "active" : "")}
          onClick={onClickTool(tool)}
        >
          {tool.title}
        </div>
      ))}
    </div>
  );
}
