import clsx from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"

import { assets } from "src/constants/assets"
import { type Tool } from "src/models/Tool"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolSessionStore } from "src/stores/toolSessionStore"

import "./ToolTabbar.scss"

export const ToolTabbar: FC = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()
  const tabs = toolSessionStore.getSessionsFromTool(activeTool)

  const isToolActive = (tool: Tool) => tool.sessionId === activeTool.sessionId

  const onClickAddTab = () => {
    toolSessionStore.createSessionAndOpen(activeTool)
  }

  const onClickTab = (tool: Tool) => () => {
    toolRunnerStore.openTool(tool)
    toolSessionStore.setLastSessionIdOfTool(tool)
  }

  return (
    <div className="ToolTabbar">
      <div className="ToolTabbar-inner">
        {tabs.map((tool, index) => (
          <div
            key={tool.sessionId}
            className={clsx("ToolTabbar-item", { active: isToolActive(tool) })}
            onClick={onClickTab(tool)}
          >
            Editor {index + 1}
            <div className="ToolTabbar-close"><img src={assets.CloseSVG} /></div>
          </div>
        ))}

        <div onClick={onClickAddTab} className="ToolTabbar-item">
          <div className="ToolTabbar-close"><img src={assets.PlusSVG} /></div>
        </div>
      </div>
    </div>
  )
})
