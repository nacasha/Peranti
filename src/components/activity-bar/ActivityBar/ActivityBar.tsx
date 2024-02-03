import { Icons } from "src/constants/icons.ts"

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
        />
        <ActivityBarItem
          icon={Icons.ThreeLineVertical}
          label="Pipelines"
          menuId="pipelines"
        />
        <ActivityBarItem
          icon={Icons.History}
          label="Closed Editor"
          menuId="history"
        />
      </div>

      <div className="ActivityBar-bottom">
        <ActivityBarItem
          icon={Icons.Gear}
          label="Settings"
          menuId="settings"
        />
      </div>
    </div>
  )
}
