import { clsx } from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"
import useOnclickOutside from "react-cool-onclickoutside"
import SimpleBar from "simplebar-react"

import { activityBarClasses } from "src/components/activity-bar/ActivityBar/ActivityBar.css"
import { ClosedEditorSidebar } from "src/components/primary-sidebar/ClosedEditorSidebar"
import { ExtensionsSidebar } from "src/components/primary-sidebar/ExtensionsSidebar"
import { ToolSidebar } from "src/components/primary-sidebar/ToolSidebar"
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
    ignoreClass: [activityBarClasses.root, "PrimarySidebar"]
  })

  const sidebarMode = isFloatingSidebar
    ? SidebarMode.FloatUnpinned
    : sidebarModeStore

  return (
    <SimpleBar
      className={clsx("PrimarySidebar", sidebarMode, !isSidebarShow && "hidden")}
      scrollableNodeProps={{ ref }}
    >
      <PrimarySidebarBody />
    </SimpleBar>
  )
})

const PrimarySidebarBody: FC = () => {
  const sidebarActiveMenuId = useSelector(() => interfaceStore.sidebarActiveMenuId)
  const Component: FC | undefined = {
    tools: ToolSidebar,
    history: ClosedEditorSidebar,
    extensions: ExtensionsSidebar
  }[sidebarActiveMenuId]

  if (Component) {
    return <Component />
  }
  return null
}
