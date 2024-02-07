import { Icons } from "src/constants/icons.ts"
import settingsTool from "src/tools/settings-tool"

import { ActivityBarItem } from "../ActivityBarItem"

import "./ActivityBar.scss"

export const ActivityBar = () => {
  return (
    <div className="ActivityBar">
      <div className="ActivityBar-main">
        <ActivityBarItem
          icon={Icons.Thunder}
          label="Tools"
          menuId="tools"
          href="/"
        />
        <ActivityBarItem
          icon={Icons.ThreeLineVertical}
          label="Pipelines"
          menuId="pipelines"
          href="/"
        />
        <ActivityBarItem
          icon={Icons.History}
          label="Closed Editor"
          menuId="history"
          href="/"
        />
      </div>

      <div className="ActivityBar-bottom">
        <ActivityBarItem
          icon={Icons.Gear}
          label="Settings"
          menuId="settings"
          toolConstructor={settingsTool}
        />
      </div>
    </div>
  )
}
