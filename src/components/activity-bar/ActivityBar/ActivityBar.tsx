import settingsTool from "src/applets/pages/settings-applet.ts"
import { Icons } from "src/constants/icons.ts"
import { commandbarService } from "src/services/commandbar-service"

import { ActivityBarItem } from "../ActivityBarItem"

import { activityBarClasses } from "./ActivityBar.css"

export const ActivityBar = () => {
  return (
    <div className={activityBarClasses.root}>
      <div className={activityBarClasses.topButtons}>
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

      <div className={activityBarClasses.bottomButtons}>
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
          appletConstructor={settingsTool}
          clickHideOnFloatingSidebar
        />
      </div>
    </div>
  )
}
