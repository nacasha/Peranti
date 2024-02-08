import settingsTool from "src/applets/pages/settings-applet.ts"
import { Icons } from "src/constants/icons.ts"
import { commandbarService } from "src/services/commandbar-service"

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
          icon={Icons.Search}
          label="Search"
          menuId="search"
          onClick={() => {
            commandbarService.open()
          }}
        />
        <ActivityBarItem
          icon={Icons.Gear}
          label="Settings"
          menuId="settings"
          appletConstructor={settingsTool}
        />
      </div>
    </div>
  )
}
