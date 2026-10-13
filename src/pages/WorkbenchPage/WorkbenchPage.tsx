import { clsx } from "clsx"
import { observer } from "mobx-react"
import { useEffect, useState, type FC } from "react"

import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons"
// Same card, header and split frame as the extensions page
import "src/pages/ExtensionsPage/ExtensionsPage.scss"
import { appletStore } from "src/services/applet-store"
import { extensionsService } from "src/services/extensions-service"
import { workbenchPageStore, type WorkbenchPageTab } from "src/services/workbench-page-store"
import { isRunningInTauri } from "src/utils/common/is-running-in-tauri"

import { ComponentsTab } from "./ComponentsTab.tsx"
import { ToolsTab } from "./ToolsTab.tsx"

/**
 * Where extensions are made: try components in a playground, and build
 * tools with a live preview
 */
export const WorkbenchPage: FC = observer(() => {
  const { pendingTab } = workbenchPageStore
  const [activeTab, setActiveTab] = useState<WorkbenchPageTab>(
    () => workbenchPageStore.consumePendingTab() ?? "tools"
  )
  const [isReloading, setIsReloading] = useState(false)

  // Opened from elsewhere while this page is already showing
  useEffect(() => {
    const tab = workbenchPageStore.consumePendingTab()
    if (tab) setActiveTab(tab)
  }, [pendingTab])

  const handleReload = async() => {
    setIsReloading(true)
    try {
      await appletStore.reloadExtensions()
    } finally {
      setIsReloading(false)
    }
  }

  return (
    <div className="ExtensionsPage WorkbenchPage">
      <div className="ExtensionsPage-header">
        <span className="ExtensionsPage-title">Manage</span>

        <div className="ExtensionsPage-tabs">
          <button
            type="button"
            className={clsx("ExtensionsPage-tab", activeTab === "tools" && "active")}
            onClick={() => { setActiveTab("tools") }}
          >
            Tools
          </button>
          <button
            type="button"
            className={clsx("ExtensionsPage-tab", activeTab === "components" && "active")}
            onClick={() => { setActiveTab("components") }}
          >
            Components
          </button>
        </div>

        <div className="ExtensionsPage-actions">
          {isRunningInTauri && (
            <>
              <ButtonIcon
                icon={Icons.Folder}
                tooltip="Open Extensions Folder"
                onClick={() => { void extensionsService.openExtensionsFolder() }}
              />
              <ButtonIcon
                icon={Icons.Refresh}
                tooltip={isReloading ? "Reloading…" : "Reload Extensions"}
                onClick={() => { void handleReload() }}
              />
            </>
          )}
        </div>
      </div>

      <div className="ExtensionsPage-body">
        {activeTab === "tools" && <ToolsTab />}
        {activeTab === "components" && <ComponentsTab />}
      </div>
    </div>
  )
})
