import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { appletStore } from "src/services/applet-store"
import { commandbarService } from "src/services/commandbar-service"
import { extensionsService } from "src/services/extensions-service"
import { toolSidebarService } from "src/services/tool-sidebar-service"

export const ExtensionsSidebar = () => {
  const loadedExtensions = useSelector(() => extensionsService.loadedExtensions)

  const handleClickRefresh = async() => {
    await appletStore.loadExtensions()
    appletStore.buildApplets()
    toolSidebarService.setupItems()
    commandbarService.setupItems()
  }

  return (
    <div className="ExtensionsSidebar">
      <div className="PrimarySidebar-title" style={{ display: "flex", justifyContent: "space-between" }}>
        <div>Extensions</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 3 }}>
          <ButtonIcon icon={Icons.Folder} onClick={() => { void handleClickRefresh() }} />
          <ButtonIcon icon={Icons.Refresh} onClick={() => { void handleClickRefresh() }} />
        </div>
      </div>

      <div className="ExtensionsSidebar-main">
        {loadedExtensions.map((extension) => (
          <div key={extension.appletId} style={{ padding: 10 }}>
            <div>{extension.appletId}</div>
            <div>{extension.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
