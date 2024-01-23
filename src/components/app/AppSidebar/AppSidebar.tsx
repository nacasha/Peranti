import { icons } from "src/constants/icons.ts"

import { AppSidebarItem } from "./AppSidebarItem.tsx"

import "./AppSidebar.scss"

export const AppSidebar = () => {
  return (
    <div className="AppSidebar">
      <AppSidebarItem
        icon={icons.Thunder}
        label="Tools"
        menuId="tools"
      />
      <AppSidebarItem
        icon={icons.ThreeLineVertical}
        label="Pipelines"
        menuId="pipelines"
      />
      <AppSidebarItem
        icon={icons.History}
        label="History"
        menuId="history"
      />
      <AppSidebarItem
        icon={icons.Gear}
        label="Settings"
        menuId="settings"
      />
    </div>
  )
}
