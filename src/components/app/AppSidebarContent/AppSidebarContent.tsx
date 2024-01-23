import { clsx } from "clsx"
import { observer } from "mobx-react"
import { memo, type FC } from "react"
import useOnclickOutside from "react-cool-onclickoutside"
import SimpleBar from "simplebar-react"

import { HistorySidebar } from "src/components/sidebar/HistorySidebar"
import { SettingsSidebar } from "src/components/sidebar/SettingsSidebar"
import { ToolSidebar } from "src/components/sidebar/ToolSidebar"
import { SidebarMode } from "src/enums/SidebarMode.ts"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/stores/interfaceStore"

import "./AppSidebarContent.scss"

export const AppSidebarContent = observer(() => {
  const {
    isSidebarShow,
    sidebarMode: sidebarModeStore,
    isFloatingSidebar
  } = interfaceStore

  const ref = useOnclickOutside(() => {
    if (isFloatingSidebar || sidebarModeStore === SidebarMode.FloatUnpinned) {
      interfaceStore.hideSidebar()
    }
  }, {
    ignoreClass: "AppSidebar"
  })

  const sidebarMode = isFloatingSidebar
    ? SidebarMode.FloatUnpinned
    : sidebarModeStore

  return (
    <SimpleBar
      className={clsx("AppSidebarContent", sidebarMode, !isSidebarShow && "hidden")}
      scrollableNodeProps={{ ref }}
    >
      <AppSidebarContentBody />
    </SimpleBar>
  )
})

const AppSidebarContentBody: FC = memo(() => {
  const sidebarActiveMenuId = useSelector(() => interfaceStore.sidebarActiveMenuId)
  let Component: FC | undefined

  if (sidebarActiveMenuId === "tools") {
    Component = ToolSidebar
  } else if (sidebarActiveMenuId === "settings") {
    Component = SettingsSidebar
  } else if (sidebarActiveMenuId === "history") {
    Component = HistorySidebar
  }

  if (Component) {
    return <Component />
  }
  return null
}, () => true)
