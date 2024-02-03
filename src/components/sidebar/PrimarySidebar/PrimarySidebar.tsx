import { clsx } from "clsx"
import { observer } from "mobx-react"
import { memo, type FC } from "react"
import useOnclickOutside from "react-cool-onclickoutside"
import SimpleBar from "simplebar-react"

import { ClosedEditorSidebar } from "src/components/sidebar-contents/ClosedEditorSidebar"
import { SettingsSidebar } from "src/components/sidebar-contents/SettingsSidebar"
import { ToolSidebar } from "src/components/sidebar-contents/ToolSidebar"
import { SidebarMode } from "src/enums/SidebarMode.ts"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/stores/interfaceStore"

import "./PrimarySidebar.scss"

export const PrimarySidebar = observer(() => {
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
    ignoreClass: ["ActivityBar", "PrimarySidebar"]
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

const PrimarySidebarBody: FC = memo(() => {
  const sidebarActiveMenuId = useSelector(() => interfaceStore.sidebarActiveMenuId)
  let Component: FC | undefined

  if (sidebarActiveMenuId === "tools") {
    Component = ToolSidebar
  } else if (sidebarActiveMenuId === "settings") {
    Component = SettingsSidebar
  } else if (sidebarActiveMenuId === "history") {
    Component = ClosedEditorSidebar
  }

  if (Component) {
    return <Component />
  }
  return null
}, () => true)
