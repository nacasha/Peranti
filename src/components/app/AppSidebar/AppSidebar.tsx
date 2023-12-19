import { assets } from "src/constants/assets"

import { AppSidebarItem } from "./AppSidebarItem.tsx"

import "./AppSidebar.scss"

export const AppSidebar = () => {
  return (
    <div className="AppSidebar">
      <AppSidebarItem
        icon={assets.ThunderSVG}
        label="Tools"
        menuId="tools"
      />
      <AppSidebarItem
        icon={assets.ThreeLineVerticalSVG}
        label="Pipelines"
        menuId="pipelines"
      />
      <AppSidebarItem
        icon={assets.HistorySVG}
        label="History"
        menuId="history"
      />
      <AppSidebarItem
        icon={assets.GearSVG}
        label="Settings"
        menuId="settings"
      />
    </div>
  )
}
