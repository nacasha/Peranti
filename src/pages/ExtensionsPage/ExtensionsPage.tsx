import NiceModal from "@ebay/nice-modal-react"
import { clsx } from "clsx"
import { observer } from "mobx-react"
import { useEffect, useState, type FC, type ReactNode } from "react"
import SimpleBar from "simplebar-react"

import { Button } from "src/components/common/Button"
import { ButtonIcon } from "src/components/common/ButtonIcon"
import { CatalogSourcesDialog } from "src/components/dialog/CatalogSourcesDialog"
import { FileNames } from "src/constants/file-names"
import { Icons } from "src/constants/icons"
import { appletStore } from "src/services/applet-store"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { extensionsPageStore, type ExtensionsPageTab } from "src/services/extensions-page-store"
import { extensionsService } from "src/services/extensions-service"
import { type CatalogExtension } from "src/types/CatalogExtension"
import { type InstalledExtension } from "src/types/InstalledExtension"
import { getCatalogEntryTools } from "src/utils/get-catalog-entry-tools"
import { getCatalogSourceLabel } from "src/utils/get-catalog-source-label"
import { getExtensionProvidesLabels } from "src/utils/get-extension-provides-labels"
import { getInstalledSourceFilter } from "src/utils/get-installed-source-filter"
import { getRuntimeSummary } from "src/utils/get-runtime-summary"
import { isRunningInTauri } from "src/utils/is-running-in-tauri"
import { matchesSearchKeyword } from "src/utils/matches-search-keyword"

import { CatalogExtensionDetails } from "./CatalogExtensionDetails.tsx"
import { CatalogSourceErrorNotice } from "./CatalogSourceErrorNotice.tsx"
import { ExtensionListItem, type ExtensionListItemTag } from "./ExtensionListItem.tsx"
import { ALL_SOURCES, ExtensionsToolbar } from "./ExtensionsToolbar.tsx"
import { InstalledExtensionDetails } from "./InstalledExtensionDetails.tsx"

import "./ExtensionsPage.scss"

const openSourcesDialog = () => {
  void NiceModal.show(CatalogSourcesDialog)
}

/**
 * Manage the extensions in the extensions folder, and browse the catalog to
 * install new ones. A list on the left, the picked extension on the right.
 */
export const ExtensionsPage: FC = observer(() => {
  const { pendingTab } = extensionsPageStore
  const [activeTab, setActiveTab] = useState<ExtensionsPageTab>(
    () => extensionsPageStore.pendingTab ?? "installed"
  )
  const [isReloading, setIsReloading] = useState(false)

  // Opened from elsewhere while this page is already showing
  useEffect(() => {
    const tab = extensionsPageStore.consumePendingTab()
    if (tab) setActiveTab(tab)
  }, [pendingTab])

  // Loaded quietly on open, so the Installed tab can show available updates
  useEffect(() => {
    void extensionCatalogService.loadCatalog()
  }, [])

  const handleReload = async() => {
    setIsReloading(true)
    try {
      await (activeTab === "browse"
        ? extensionCatalogService.loadCatalog(true)
        : appletStore.reloadExtensions())
    } finally {
      setIsReloading(false)
    }
  }

  const handleOpenFolder = () => {
    void extensionsService.openExtensionsFolder()
  }

  return (
    <div className="ExtensionsPage">
      <div className="ExtensionsPage-header">
        <span className="ExtensionsPage-title">Extensions</span>

        <div className="ExtensionsPage-tabs">
          <button
            type="button"
            className={clsx("ExtensionsPage-tab", activeTab === "installed" && "active")}
            onClick={() => { setActiveTab("installed") }}
          >
            Installed
            <span className="ExtensionsPage-count">{extensionsService.installedExtensions.length}</span>
            {extensionCatalogService.updateCount > 0 && (
              <span className="ExtensionsPage-count is-update">
                {extensionCatalogService.updateCount} update{extensionCatalogService.updateCount > 1 ? "s" : ""}
              </span>
            )}
          </button>
          <button
            type="button"
            className={clsx("ExtensionsPage-tab", activeTab === "browse" && "active")}
            onClick={() => { setActiveTab("browse") }}
          >
            Browse
          </button>
        </div>

        <div className="ExtensionsPage-actions">
          <ButtonIcon
            icon={Icons.Settings}
            tooltip="Catalog Sources"
            onClick={openSourcesDialog}
          />
          {isRunningInTauri && (
            <ButtonIcon
              icon={Icons.Folder}
              tooltip="Open Extensions Folder"
              onClick={handleOpenFolder}
            />
          )}
          {(isRunningInTauri || activeTab === "browse") && (
            <ButtonIcon
              icon={Icons.Refresh}
              tooltip={isReloading ? "Reloading…" : activeTab === "browse" ? "Refresh Catalog" : "Reload Extensions"}
              onClick={() => { void handleReload() }}
            />
          )}
        </div>
      </div>

      <div className="ExtensionsPage-body">
        {activeTab === "installed" ? <InstalledTab onOpenFolder={handleOpenFolder} /> : <BrowseTab />}
      </div>
    </div>
  )
})

const getInstalledTag = (extension: InstalledExtension): ExtensionListItemTag | undefined => {
  if (extension.error) return { label: "Error", tone: "danger" }
  if (extensionCatalogService.getUpdate(extension)) return { label: "Update", tone: "accent" }
  if (!extensionsService.isEnabled(extension)) return { label: "Disabled", tone: "muted" }
  return undefined
}

const InstalledTab: FC<{ onOpenFolder: () => void }> = observer(({ onOpenFolder }) => {
  const { installedExtensions } = extensionsService
  const [selectedFolderName, setSelectedFolderName] = useState<string>()
  const [keyword, setKeyword] = useState("")
  const [sourceFilter, setSourceFilter] = useState(ALL_SOURCES)

  if (!isRunningInTauri) {
    return (
      <ExtensionsPagePlaceholder
        icon={<Icons.Extensions size={28} aria-hidden />}
        title="Extensions need the desktop app"
        description="The browser version can't read the extensions folder yet."
      />
    )
  }

  if (installedExtensions.length === 0) {
    return (
      <ExtensionsPagePlaceholder
        icon={<Icons.Extensions size={28} aria-hidden />}
        title="No extensions installed"
        description={`Install one from Browse, or place a folder with a ${FileNames.ExtensionDefinition} file in the extensions folder.`}
        action={<Button icon={Icons.Folder} onClick={onOpenFolder}>Open Extensions Folder</Button>}
      />
    )
  }

  // One option per source something was installed from, in list order
  const sourceOptions = [...new Map(installedExtensions.map((extension) => [
    getInstalledSourceFilter(extension),
    { label: extensionCatalogService.getInstalledSourceLabel(extension), value: getInstalledSourceFilter(extension) }
  ])).values()]

  // A filter on a source that has nothing installed anymore shows everything
  const activeSourceFilter = sourceOptions.some((option) => option.value === sourceFilter) ? sourceFilter : ALL_SOURCES

  const filteredExtensions = installedExtensions
    .filter((extension) => activeSourceFilter === ALL_SOURCES || getInstalledSourceFilter(extension) === activeSourceFilter)
    .filter(({ manifest, folderName, tools }) => matchesSearchKeyword(keyword, [
      manifest?.name ?? folderName,
      manifest?.description,
      manifest?.category,
      manifest?.author,
      ...tools.map((tool) => tool.definition.name)
    ]))

  // Falls back to the first one, also after the picked one is uninstalled
  const selected = filteredExtensions.find((extension) => extension.folderName === selectedFolderName) ??
    filteredExtensions[0] as InstalledExtension | undefined

  return (
    <ExtensionsSplit
      toolbar={(
        <ExtensionsToolbar
          keyword={keyword}
          onKeywordChange={setKeyword}
          sourceFilter={activeSourceFilter}
          onSourceFilterChange={setSourceFilter}
          sourceOptions={sourceOptions}
        />
      )}
      list={filteredExtensions.length === 0
        ? <div className="ExtensionsPage-listEmpty">{`Nothing matches "${keyword.trim()}"`}</div>
        : filteredExtensions.map((extension) => {
          const { manifest } = extension

          return (
            <ExtensionListItem
              key={extension.folderName}
              name={manifest?.name ?? extension.folderName}
              version={manifest?.version}
              description={extension.error ?? manifest?.description}
              meta={[
                manifest?.author,
                getRuntimeSummary(extension.tools.map((tool) => tool.definition.runtime))
              ].filter(Boolean).join(" · ")}
              provides={getExtensionProvidesLabels(extension.tools.length, extension.components.length)}
              tag={getInstalledTag(extension)}
              isDimmed={!extensionsService.isEnabled(extension)}
              isSelected={extension === selected}
              onSelect={() => { setSelectedFolderName(extension.folderName) }}
            />
          )
        })}
      details={selected
        ? <InstalledExtensionDetails key={selected.folderName} extension={selected} />
        : (
          <ExtensionsPagePlaceholder
            icon={<Icons.Extensions size={28} aria-hidden />}
            title="No extension selected"
            description="Pick an extension from the list to see its details."
          />
        )}
    />
  )
})

const getCatalogTag = (entry: CatalogExtension): ExtensionListItemTag | undefined => {
  switch (extensionCatalogService.getStatus(entry)) {
  case "update-available": return { label: "Update", tone: "accent" }
  case "installed": return { label: "Installed", tone: "muted" }
  case "conflict": return { label: "Conflict", tone: "danger" }
  default: return undefined
  }
}

const getCatalogKey = (entry: CatalogExtension) => `${entry.sourceId}:${entry.id}`

const BrowseTab: FC = observer(() => {
  const { catalogExtensions, isLoading, isLoaded, failedSources, enabledSources } = extensionCatalogService
  const [keyword, setKeyword] = useState("")
  const [sourceFilter, setSourceFilter] = useState(ALL_SOURCES)
  const [selectedKey, setSelectedKey] = useState<string>()

  if (enabledSources.length === 0) {
    return (
      <ExtensionsPagePlaceholder
        icon={<Icons.Browse size={28} aria-hidden />}
        title="Every source is turned off"
        description="Turn a catalog source back on, or add a new one."
        action={<Button icon={Icons.Settings} onClick={openSourcesDialog}>Manage Sources</Button>}
      />
    )
  }

  if (failedSources.length === enabledSources.length) {
    return (
      <ExtensionsPagePlaceholder
        icon={<Icons.Warning size={28} aria-hidden />}
        title="Catalog unavailable"
        description={failedSources[0].error}
        action={<Button icon={Icons.Refresh} onClick={() => { void extensionCatalogService.loadCatalog(true) }}>Retry</Button>}
      />
    )
  }

  // A filter on a source that was since turned off or removed shows everything
  const activeSourceFilter = enabledSources.some((source) => source.id === sourceFilter) ? sourceFilter : ALL_SOURCES
  const hasManySources = enabledSources.length > 1
  const isFirstLoad = !isLoaded || (isLoading && catalogExtensions.length === 0)

  const filteredExtensions = catalogExtensions
    .filter((entry) => activeSourceFilter === ALL_SOURCES || entry.sourceId === activeSourceFilter)
    .filter((entry) => matchesSearchKeyword(keyword, [
      entry.name,
      entry.description,
      entry.category,
      entry.author,
      ...(entry.tools ?? []).map((tool) => tool.name)
    ]))

  const selected = filteredExtensions.find((entry) => getCatalogKey(entry) === selectedKey) ?? filteredExtensions[0]

  const renderList = () => {
    if (isFirstLoad) {
      return [0, 1, 2, 3].map((index) => <div key={index} className="ExtensionListItem is-skeleton" />)
    }

    if (filteredExtensions.length === 0) {
      return (
        <div className="ExtensionsPage-listEmpty">
          {keyword.trim() ? `Nothing matches "${keyword.trim()}"` : "The enabled sources have no extensions yet"}
        </div>
      )
    }

    return filteredExtensions.map((entry) => (
      <ExtensionListItem
        key={getCatalogKey(entry)}
        name={entry.name}
        version={entry.version}
        description={entry.description}
        meta={[
          entry.author,
          hasManySources && extensionCatalogService.getSourceLabel(entry.sourceId)
        ].filter(Boolean).join(" · ")}
        provides={getExtensionProvidesLabels(getCatalogEntryTools(entry).length, entry.components?.length ?? 0)}
        tag={getCatalogTag(entry)}
        isSelected={entry === selected}
        onSelect={() => { setSelectedKey(getCatalogKey(entry)) }}
      />
    ))
  }

  return (
    <ExtensionsSplit
      toolbar={(
        <ExtensionsToolbar
          keyword={keyword}
          onKeywordChange={setKeyword}
          sourceFilter={activeSourceFilter}
          onSourceFilterChange={setSourceFilter}
          sourceOptions={enabledSources.map((source) => ({ label: getCatalogSourceLabel(source), value: source.id }))}
        >
          {failedSources.map(({ source, error }) => (
            <CatalogSourceErrorNotice
              key={source.id}
              source={source}
              error={error}
              onManageSources={openSourcesDialog}
            />
          ))}
        </ExtensionsToolbar>
      )}
      list={renderList()}
      details={selected
        ? <CatalogExtensionDetails key={getCatalogKey(selected)} entry={selected} />
        : !isFirstLoad && (
          <ExtensionsPagePlaceholder
            icon={<Icons.Browse size={28} aria-hidden />}
            title="No extension selected"
            description="Pick an extension from the list to see its details."
          />
        )}
    />
  )
})

interface ExtensionsSplitProps {
  toolbar?: ReactNode
  list: ReactNode
  details: ReactNode
}

/**
 * Extension list on the left, details of the picked one on the right, each
 * scrolling on its own
 */
const ExtensionsSplit: FC<ExtensionsSplitProps> = ({ toolbar, list, details }) => (
  <div className="ExtensionsPage-split">
    <div className="ExtensionsPage-listPane">
      {toolbar && <div className="ExtensionsPage-toolbar">{toolbar}</div>}
      <div className="ExtensionsPage-scrollArea">
        <SimpleBar className="ExtensionsPage-scroll">
          <div className="ExtensionsPage-list" role="list">{list}</div>
        </SimpleBar>
      </div>
    </div>

    {/* Details scroll on their own, so the Files tab can fill the pane instead */}
    <div className="ExtensionsPage-detailsPane">
      {details}
    </div>
  </div>
)

interface ExtensionsPagePlaceholderProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

const ExtensionsPagePlaceholder: FC<ExtensionsPagePlaceholderProps> = ({ icon, title, description, action }) => (
  <div className="ExtensionsPage-placeholder">
    {icon}
    <div className="ExtensionsPage-placeholder-title">{title}</div>
    <div className="ExtensionsPage-placeholder-description">{description}</div>
    {action}
  </div>
)
