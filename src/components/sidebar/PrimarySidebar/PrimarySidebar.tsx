import { clsx } from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"
import useOnclickOutside from "react-cool-onclickoutside"
import SimpleBar from "simplebar-react"
import { useLocation } from "wouter"

import { ClosedEditorSidebar } from "src/components/sidebar-contents/ClosedEditorSidebar"
import { ToolSidebar } from "src/components/sidebar-contents/ToolSidebar"
import { SidebarMode } from "src/enums/sidebar-mode"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

import "./PrimarySidebar.scss"

export const PrimarySidebar = observer(() => {
  const { isSidebarShow, sidebarMode: sidebarModeStore, isFloatingSidebar } = interfaceStore

  const ref = useOnclickOutside(() => {
    if (isFloatingSidebar || sidebarModeStore === SidebarMode.FloatUnpinned) {
      interfaceStore.hideSidebar()
    }
  }, {
    ignoreClass: ["ActivityBar", "PrimarySidebar"]
  })

  const [location] = useLocation()
  const isSidebarHidden = ["/settings"].includes(location) || !isSidebarShow

  const sidebarMode = isFloatingSidebar
    ? SidebarMode.FloatUnpinned
    : sidebarModeStore

  return (
    <SimpleBar
      className={clsx("PrimarySidebar", sidebarMode, isSidebarHidden && "hidden")}
      scrollableNodeProps={{ ref }}
    >
      <PrimarySidebarBody />
    </SimpleBar>
  )
})

const PrimarySidebarBody: FC = () => {
  const sidebarActiveMenuId = useSelector(() => interfaceStore.sidebarActiveMenuId)
  let Component: FC | undefined

  if (sidebarActiveMenuId === "tools") {
    Component = ToolSidebar
  } else if (sidebarActiveMenuId === "history") {
    Component = ClosedEditorSidebar
  }

  if (Component) {
    return <Component />
  }
  return null
}
