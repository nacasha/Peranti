import clsx from "clsx"
import { observer } from "mobx-react"
import { type MouseEventHandler, type FC } from "react"

import { assets } from "src/constants/assets"
import { type Tool } from "src/models/Tool"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolSessionStore } from "src/stores/toolSessionStore"

import "./ToolTabbar.scss"

export const ToolTabbar: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()
  const tabs = toolSessionStore.getRunningSessionsFromTool(activeTool.toolId)

  const isToolActive = (tool: Tool) => tool.sessionId === activeTool.sessionId

  const onClickAddTab = () => {
    for (let index = 0; index < 10; index++) {
      toolSessionStore.createSession(activeTool)
    }
  }

  const onClickTab = (tool: Tool) => () => {
    toolSessionStore.openSession(tool)
  }

  const onClickCloseTab = (tool: Tool): MouseEventHandler => (event) => {
    event.stopPropagation()
    toolSessionStore.closeSession(tool)
  }

  return (
    <div className="ToolTabbar">
      <div className="ToolTabbar-inner">
        {tabs.map((tool) => (
          <div
            key={tool.sessionId}
            className={clsx("ToolTabbar-item", { active: isToolActive(tool) })}
            onClick={onClickTab(tool)}
          >
            {tool.sessionName}
            {tool.isActionRunning ? " ..." : ""}
            <div className="ToolTabbar-icon" onClick={onClickCloseTab(tool)}>
              <img src={assets.CloseSVG} alt="Close Tab" />
            </div>
          </div>
        ))}

        <div onClick={onClickAddTab} className="ToolTabbar-item new">
          <div className="ToolTabbar-icon"><img src={assets.PlusSVG} alt="Add Tab" /></div>
        </div>
      </div>
    </div>
  )
})
