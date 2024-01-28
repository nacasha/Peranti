import { Icons } from "src/constants/icons.ts"

import { AppSidebarItem } from "./AppSidebarItem.tsx"

import "./AppSidebar.scss"

export const AppSidebar = () => {
  return (
    <div className="AppSidebar">
      <div className="AppSidebar-main">
        <AppSidebarItem
          icon={Icons.Thunder}
          label="Tools"
          menuId="tools"
        />
        <AppSidebarItem
          icon={Icons.ThreeLineVertical}
          label="Pipelines"
          menuId="pipelines"
        />
        <AppSidebarItem
          icon={Icons.History}
          label="Close Editor"
          menuId="history"
        />
      </div>

      <div className="AppSidebar-bottom">
        <AppSidebarItem
          icon={Icons.Gear}
          label="Settings"
          menuId="settings"
        />
      </div>
    </div>
  )
}
