import { clsx } from "clsx"
import { observer } from "mobx-react"
import { useEffect, useState, type FC } from "react"

// Same card, header and split frame as the extensions page
import "src/pages/ExtensionsPage/ExtensionsPage.scss"
import { workbenchPageStore, type WorkbenchPageTab } from "src/services/workbench-page-store"

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

  // Opened from elsewhere while this page is already showing
  useEffect(() => {
    const tab = workbenchPageStore.consumePendingTab()
    if (tab) setActiveTab(tab)
  }, [pendingTab])

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
      </div>

      <div className="ExtensionsPage-body">
        {activeTab === "tools" && <ToolsTab />}
        {activeTab === "components" && <ComponentsTab />}
      </div>
    </div>
  )
})
