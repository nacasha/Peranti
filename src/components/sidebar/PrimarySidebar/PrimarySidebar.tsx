import { clsx } from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"
import useOnclickOutside from "react-cool-onclickoutside"
import SimpleBar from "simplebar-react"

import { settingsApplet } from "src/applets/pages/settings-applet"
import { ButtonIcon } from "src/components/common/ButtonIcon"
import { ExtensionsSidebar } from "src/components/primary-sidebar/ExtensionsSidebar"
import { ToolSidebar } from "src/components/primary-sidebar/ToolSidebar"
import { SidebarResizeHandle } from "src/components/sidebar/SidebarResizeHandle"
import { Icons } from "src/constants/icons"
import { PrimarySidebarWidth } from "src/constants/sidebar-width"
import { SidebarMode } from "src/enums/sidebar-mode"
import { useSelector } from "src/hooks/useSelector"
import { commandbarService } from "src/services/commandbar-service"
import { interfaceStore } from "src/services/interface-store"
import { sessionStore } from "src/services/session-store"

import "./PrimarySidebar.scss"

export const PrimarySidebar = observer(() => {
  const { isSidebarShow, sidebarMode: sidebarModeStore, isFloatingSidebar, primarySidebarWidth } = interfaceStore

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

  const handleClickToggleSidebar = () => {
    interfaceStore.toggleSidebar()
  }

  const handleClickSearch = () => {
    commandbarService.open()
  }

  const handleClickSettings = () => {
    sessionStore.findOrCreateSession(settingsApplet)
  }

  return (
    <div className={clsx("PrimarySidebar", sidebarMode, !isSidebarShow && "hidden")}>
      <div className="PrimarySidebar-title" data-tauri-drag-region>
        <ButtonIcon
          icon={Icons.PanelLeft}
          tooltip="Hide Sidebar"
          onClick={handleClickToggleSidebar}
        />
        <div className="PrimarySidebar-actions">
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
      {isSidebarShow && (
        <SidebarResizeHandle
          edge="right"
          width={primarySidebarWidth}
          defaultWidth={PrimarySidebarWidth.default}
          onResize={(width) => { interfaceStore.setPrimarySidebarWidth(width) }}
        />
      )}
    </div>
  )
})

const PrimarySidebarBody: FC = () => {
  const sidebarActiveMenuId = useSelector(() => interfaceStore.sidebarActiveMenuId)
  const Component: FC | undefined = {
    tools: ToolSidebar,
    extensions: ExtensionsSidebar
  }[sidebarActiveMenuId]

  if (Component) {
    return <Component />
  }
  return null
}
