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
  const tabs = toolSessionStore.getSessionListFromTool(activeTool)

  const isToolActive = (tool: Tool) => tool.sessionId === activeTool.sessionId

  const onClickAddTab = () => {
    toolSessionStore.createSession(activeTool)
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
            <div className="ToolTabbar-icon" onClick={onClickCloseTab(tool)}>
              <img src={assets.CloseSVG} />
            </div>
          </div>
        ))}

        <div onClick={onClickAddTab} className="ToolTabbar-item new">
          <div className="ToolTabbar-icon"><img src={assets.PlusSVG} /></div>
        </div>
      </div>
    </div>
  )
})
