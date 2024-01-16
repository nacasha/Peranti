import { clsx } from "clsx"
import { observer } from "mobx-react"
import useOnclickOutside from "react-cool-onclickoutside"

import { HistorySidebar } from "src/components/sidebar/HistorySidebar"
import { SettingsSidebar } from "src/components/sidebar/SettingsSidebar"
import { ToolSidebar } from "src/components/sidebar/ToolSidebar"
import { SidebarMode } from "src/enums/SidebarMode.ts"
import { interfaceStore } from "src/stores/interfaceStore"

import "./AppSidebarContent.scss"

export const AppSidebarContent = observer(() => {
  const {
    isSidebarShow,
    sidebarMode: sidebarModeStore,
    sidebarActiveMenuId,
    isFloatingSidebar
  } = interfaceStore

  const ref = useOnclickOutside(() => {
    if (isFloatingSidebar) {
      interfaceStore.hideSidebar()
    }
  }, {
    ignoreClass: "AppSidebar"
  })

  let sidebarMode = sidebarModeStore
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

  if (isFloatingSidebar) {
    sidebarMode = SidebarMode.FloatUnpinned
  }

  return (
    <div ref={ref} className={clsx("AppSidebarContent", sidebarMode, !isSidebarShow && "hidden")}>
      <div className="title">{title}</div>
      {component}
    </div>
  )
})
