import { clsx } from "clsx"
import { observer } from "mobx-react"

import { HistorySidebar } from "src/components/sidebar/HistorySidebar"
import { SettingsSidebar } from "src/components/sidebar/SettingsSidebar"
import { ToolSidebar } from "src/components/sidebar/ToolSidebar"
import { interfaceStore } from "src/stores/interfaceStore"

import "./AppSidebarContent.scss"

export const AppSidebarContent = observer(() => {
  const { isSidebarShow, sidebarMode, sidebarActiveMenuId } = interfaceStore

  let component = null
  let title = ""

  if (sidebarActiveMenuId === "tools") {
    title = "Tools"
    component = <ToolSidebar />
  } else if (sidebarActiveMenuId === "settings") {
    title = "Settings"
    component = <SettingsSidebar />
  } else if (sidebarActiveMenuId === "history") {
    title = "History"
    component = <HistorySidebar />
  }

  return (
    <div className={clsx("AppSidebarContent", sidebarMode, !isSidebarShow && "hidden")}>
      <div className="title">{title}</div>
      {component}
    </div>
  )
})
