import { clsx } from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"
import useOnclickOutside from "react-cool-onclickoutside"
import SimpleBar from "simplebar-react"

import settingsApplet from "src/applets/pages/settings-applet"
import { ButtonIcon } from "src/components/common/ButtonIcon"
import { ClosedEditorSidebar } from "src/components/primary-sidebar/ClosedEditorSidebar"
import { ExtensionsSidebar } from "src/components/primary-sidebar/ExtensionsSidebar"
import { ToolSidebar } from "src/components/primary-sidebar/ToolSidebar"
import { Icons } from "src/constants/icons"
import { SidebarMode } from "src/enums/sidebar-mode"
import { useSelector } from "src/hooks/useSelector"
import { commandbarService } from "src/services/commandbar-service"
import { interfaceStore } from "src/services/interface-store"
import { sessionStore } from "src/services/session-store"

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

  const sidebarMode = isFloatingSidebar
    ? SidebarMode.FloatUnpinned
    : sidebarModeStore

  const handleClickSearch = () => {
    commandbarService.open()
  }

  const handleClickSettings = () => {
    sessionStore.findOrCreateSession(settingsApplet)
  }

  return (
    <div className={clsx("PrimarySidebar", sidebarMode, !isSidebarShow && "hidden")}>
      <div className="PrimarySidebar-title" data-tauri-drag-region>
        <div>Peranti</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 3 }}>
          <ButtonIcon
            icon={Icons.Settings}
            tooltip="Settings"
            onClick={handleClickSettings}
          />
          <ButtonIcon
            icon={Icons.Search}
            tooltip="Search"
            onClick={handleClickSearch}
          />
        </div>
      </div>
      <SimpleBar
        className="PrimarySidebar-body"
        scrollableNodeProps={{ ref }}
      >
        <PrimarySidebarBody />
      </SimpleBar>
    </div>
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
