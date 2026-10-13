import { observer } from "mobx-react"

import { extensionsApplet } from "src/applets/pages/extensions-applet"
import { workbenchApplet } from "src/applets/pages/workbench-applet"
import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons"
import { appletStore } from "src/services/applet-store"
import { extensionsService } from "src/services/extensions-service"
import { sessionStore } from "src/services/session-store"

import "./ExtensionsSidebar.scss"

export const ExtensionsSidebar = observer(() => {
  const { loadedTools, installedExtensions } = extensionsService
  const failedCount = installedExtensions.filter((extension) => extension.error).length

  const handleClickManage = () => {
    sessionStore.findOrCreateSession(extensionsApplet)
  }

  return (
    <div className="ExtensionsSidebar">
      <div className="PrimarySidebar-title">
        <div>Extensions</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 3 }}>
          <ButtonIcon
            icon={Icons.Folder}
            tooltip="Open Extensions Folder"
            onClick={() => { void extensionsService.openExtensionsFolder() }}
          />
          <ButtonIcon
            icon={Icons.Refresh}
            tooltip="Reload Extensions"
            onClick={() => { void appletStore.reloadExtensions() }}
          />
          <ButtonIcon
            icon={Icons.Manage}
            tooltip="Manage Tools & Components"
            onClick={() => { sessionStore.findOrCreateSession(workbenchApplet) }}
          />
          <ButtonIcon
            icon={Icons.Settings}
            tooltip="Manage Extensions"
            onClick={handleClickManage}
          />
        </div>
      </div>

      <div className="ExtensionsSidebar-main">
        {loadedTools.map(({ appletConstructor }) => (
          <div
            key={appletConstructor.appletId}
            className="ExtensionsSidebar-item"
            onClick={() => { sessionStore.findOrCreateSession(appletConstructor) }}
          >
            <Icons.Extension size={14} aria-hidden />
            <span>{appletConstructor.name}</span>
          </div>
        ))}

        {failedCount > 0 && (
          <div
            className="ExtensionsSidebar-item is-warning"
            onClick={handleClickManage}
          >
            <Icons.Warning size={14} aria-hidden />
            <span>{failedCount} failed to load</span>
          </div>
        )}

        {installedExtensions.length === 0 && (
          <div
            className="ExtensionsSidebar-item"
            onClick={handleClickManage}
          >
            <Icons.Extensions size={14} aria-hidden />
            <span>No extensions installed</span>
          </div>
        )}
      </div>
    </div>
  )
})
