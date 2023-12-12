import "./AppSidebar.scss"
import { assets } from "src/constants/assets"
import { AppSidebarItem } from "./AppSidebarItem"

export const AppSidebar = () => {
  return (
    <div className={"AppSidebar"}>
      <AppSidebarItem
        icon={assets.HomeSVG}
        label={"Home"}
        path={"/"}
      />
      <AppSidebarItem
        icon={assets.ThunderSVG}
        label={"Tools"}
        path={"/tools"}
      />
      <AppSidebarItem
        icon={assets.ThreeLineVerticalSVG}
        label={"Pipelines"}
        path={"/pipelines"}
      />
      <AppSidebarItem
        icon={assets.HistorySVG}
        label={"History"}
        path={"/history"}
      />
      <AppSidebarItem
        icon={assets.GearSVG}
        label={"Settings"}
        path={"/settings"}
      />
    </div>
  )
}
