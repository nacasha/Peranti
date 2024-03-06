import settingsApplet from "src/applets/pages/settings-applet.ts"
import { Icons } from "src/constants/icons.ts"
import { commandbarService } from "src/services/commandbar-service"

import { ActivityBarItem } from "../ActivityBarItem"

import "./ActivityBar.scss"

export const ActivityBar = () => {
  return (
    <div className="ActivityBar">
      <div className="ActivityBar-top">
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
        <ActivityBarItem
          icon={Icons.Extensions}
          label="Extensions"
          menuId="extensions"
        />
      </div>

      <div className="ActivityBar-bottom">
        <ActivityBarItem
          icon={Icons.Search}
          label="Search"
          menuId="search"
          clickHideOnFloatingSidebar
          onClick={() => {
            commandbarService.open()
          }}
        />
        <ActivityBarItem
          icon={Icons.Gear}
          label="Settings"
          menuId="settings"
          appletConstructor={settingsApplet}
          clickHideOnFloatingSidebar
        />
      </div>
    </div>
  )
}
