import { clsx } from "clsx"
import { observer } from "mobx-react"
import { useEffect, useState, type FC, type ReactNode } from "react"
import SimpleBar from "simplebar-react"

import { settingsApplet } from "src/applets/pages/settings-applet"
import { Button } from "src/components/common/Button"
import { ButtonIcon } from "src/components/common/ButtonIcon"
import { FileNames } from "src/constants/file-names"
import { Icons } from "src/constants/icons"
import { PageStateProvider } from "src/contexts/PageStateContext"
import { ExtensionPlatform } from "src/enums/extension-platform"
import { useNow } from "src/hooks/useNow"
import { usePageScroll } from "src/hooks/usePageScroll"
import { usePageState } from "src/hooks/usePageState"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { extensionsPageStore, type ExtensionsPageTab } from "src/services/extensions-page-store"
import { extensionsService } from "src/services/extensions-service"
import { sessionStore } from "src/services/session-store"
import { settingsPageStore } from "src/services/settings-page-store"
import { type CatalogExtension } from "src/types/CatalogExtension"
import { type InstalledExtension } from "src/types/InstalledExtension"
import { formatCatalogUpdatedLabel, getInstalledSourceFilter } from "src/utils/catalog/catalog-display"
import { getCatalogSourceLabel } from "src/utils/catalog/catalog-sources"
import { refreshCatalogWithToast, reloadExtensionsWithToast } from "src/utils/catalog/catalog-toasts"
import { isRunningInTauri } from "src/utils/common/is-running-in-tauri"
import { getExtensionPlatform, getExtensionProvidesLabels } from "src/utils/extension/extension-summary"
import { openExtensionPage } from "src/utils/extension/open-extension-page"
import { matchesSearchKeyword } from "src/utils/search/matches-search-keyword"
import { pluralize } from "src/utils/text/pluralize"
import { prettyDateFormat } from "src/utils/time/pretty-date-format"

import { CatalogInstallButton } from "./CatalogInstallButton.tsx"
import { CatalogSourceErrorNotice } from "./CatalogSourceErrorNotice.tsx"
import { type ExtensionListItemTag } from "./ExtensionListItem.tsx"
import { ExtensionStoreCard } from "./ExtensionStoreCard.tsx"
import { ExtensionsPagePlaceholder } from "./ExtensionsPagePlaceholder.tsx"
import { ALL_SOURCES, ExtensionsToolbar } from "./ExtensionsToolbar.tsx"

import "./ExtensionsPage.scss"

// Sources are managed in Settings → Extensions
const openExtensionSettings = () => {
  settingsPageStore.openSection("extensions")
  sessionStore.findOrCreateSession(settingsApplet)
}

interface ExtensionsPageProps {
  /**
   * State of the page kept in its tab, see `PageStateProvider`
   */
  initialState?: unknown
  onStateChange?: (state: Record<string, unknown>) => void
}

/**
 * An extension store: discover extensions in the catalogs and install them,
 * and manage the installed ones. A grid of cards, each opening its extension
 * in a tab of its own.
 */
export const ExtensionsPage: FC<ExtensionsPageProps> = ({ initialState, onStateChange }) => (
  <PageStateProvider initialState={initialState} onStateChange={onStateChange}>
    <ExtensionsPageContent />
  </PageStateProvider>
)

const ExtensionsPageContent: FC = observer(() => {
  const { pendingTab } = extensionsPageStore
  const [activeTab, setActiveTab] = usePageState<ExtensionsPageTab>("tab", "installed")
  const [isReloading, setIsReloading] = useState(false)

  // Opened from a command, the asked tab wins over the one left last time.
  // Also runs when it's asked while this page is already showing.
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
        ? refreshCatalogWithToast()
        : reloadExtensionsWithToast())
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
                {pluralize(extensionCatalogService.updateCount, "update")}
              </span>
            )}
          </button>
          <button
            type="button"
            className={clsx("ExtensionsPage-tab", activeTab === "browse" && "active")}
            onClick={() => { setActiveTab("browse") }}
          >
            Discover
          </button>
        </div>

        <div className="ExtensionsPage-actions">
          <ButtonIcon
            icon={Icons.Settings}
            tooltip="Extension Settings"
            onClick={openExtensionSettings}
          />
          {isRunningInTauri && (
            <ButtonIcon
              icon={Icons.Folder}
              tooltip="Open Extensions Folder"
              onClick={handleOpenFolder}
            />
          )}
          <ButtonIcon
            icon={Icons.Refresh}
            tooltip={isReloading ? "Reloading…" : activeTab === "browse" ? "Refresh Catalog" : "Reload Extensions"}
            onClick={() => { void handleReload() }}
          />
        </div>
      </div>

      <div className="ExtensionsPage-body">
        {activeTab === "installed" && (
          <InstalledTab onOpenFolder={handleOpenFolder} onOpenDiscover={() => { setActiveTab("browse") }} />
        )}
        {activeTab === "browse" && <BrowseTab />}
      </div>
    </div>
  )
})

const getInstalledTag = (extension: InstalledExtension): ExtensionListItemTag | undefined => {
  if (extension.error) return { label: "Error", tone: "danger" }
  if (extensionCatalogService.getUpdate(extension)) return { label: "Update", tone: "accent" }
  if (!extensionsService.isEnabled(extension)) return { label: "Disabled", tone: "muted" }
  if (extension.linkedSourceId) return { label: "Linked", tone: "muted" }
  return undefined
}

interface InstalledTabProps {
  onOpenFolder: () => void
  onOpenDiscover: () => void
}

const InstalledTab: FC<InstalledTabProps> = observer(({ onOpenFolder, onOpenDiscover }) => {
  const { installedExtensions } = extensionsService
  const [keyword, setKeyword] = usePageState("installed.keyword", "")
  const [sourceFilter, setSourceFilter] = usePageState("installed.source", ALL_SOURCES)
  const [platform, setPlatform] = usePageState<PlatformFilter>("installed.platform", ALL_PLATFORMS)

  if (installedExtensions.length === 0) {
    return (
      <ExtensionsPagePlaceholder
        icon={<Icons.Extensions size={28} aria-hidden />}
        title="No extensions installed"
        description={isRunningInTauri
          ? `Install one from Discover, or place a folder with a ${FileNames.ExtensionDefinition} file in the extensions folder.`
          : "Install one from Discover. It's kept in this browser."}
        action={(
          <div className="ExtensionsPage-placeholder-actions">
            <Button icon={Icons.Browse} variant="primary" onClick={onOpenDiscover}>Discover Extensions</Button>
            {isRunningInTauri && <Button icon={Icons.Folder} onClick={onOpenFolder}>Open Extensions Folder</Button>}
          </div>
        )}
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
  const fromSource = installedExtensions
    .filter((extension) => activeSourceFilter === ALL_SOURCES || getInstalledSourceFilter(extension) === activeSourceFilter)
  const filteredExtensions = fromSource
    .filter((extension) => platform === ALL_PLATFORMS || getExtensionPlatform(
      extension.tools.map((tool) => tool.definition.runtime)
    ) === platform)
    .filter(({ manifest, folderName, tools }) => matchesSearchKeyword(keyword, [
      manifest?.name ?? folderName,
      manifest?.description,
      manifest?.category,
      manifest?.author,
      ...tools.map((tool) => tool.definition.name)
    ]))

  // Updates first, so they're seen without scrolling
  const updates = filteredExtensions.filter((extension) => extensionCatalogService.getUpdate(extension))
  const others = filteredExtensions.filter((extension) => !extensionCatalogService.getUpdate(extension))

  const renderCard = (extension: InstalledExtension) => {
    const { manifest } = extension
    const update = extensionCatalogService.getUpdate(extension)
    const isEnabled = extensionsService.isEnabled(extension)

    return (
      <ExtensionStoreCard
        key={extension.folderName}
        name={manifest?.name ?? extension.folderName}
        version={manifest?.version}
        author={manifest?.author}
        category={manifest?.category}
        description={extension.error ?? manifest?.description}
        provides={getExtensionProvidesLabels(extension.tools.length, extension.components.length)}
        tag={getInstalledTag(extension)}
        isDimmed={!isEnabled}
        action={update && <CatalogInstallButton entry={update} isCompact />}
        onSelect={() => { openExtensionPage(extension.id, manifest?.name ?? extension.folderName) }}
      />
    )
  }

  return (
    <ExtensionStore
      scrollKey="installed.scroll"
      title="Installed extensions"
      subtitle={`${installedExtensions.length} installed or linked from a local folder`}
      toolbar={(
        <ExtensionsToolbar
          keyword={keyword}
          onKeywordChange={setKeyword}
          sourceFilter={activeSourceFilter}
          onSourceFilterChange={setSourceFilter}
          sourceOptions={sourceOptions}
        />
      )}
      platform={platform}
      onPlatformChange={setPlatform}
    >
      {filteredExtensions.length === 0 && (
        <div className="ExtensionStore-empty">
          {keyword.trim() ? `Nothing matches "${keyword.trim()}"` : "No installed extensions for this platform"}
        </div>
      )}
      {updates.length > 0 && (
        <ExtensionStoreSection title="Updates available" count={updates.length}>
          {updates.map(renderCard)}
        </ExtensionStoreSection>
      )}
      {others.length > 0 && (
        <ExtensionStoreSection title={updates.length > 0 ? "Up to date" : undefined} count={others.length}>
          {others.map(renderCard)}
        </ExtensionStoreSection>
      )}
    </ExtensionStore>
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
  const { catalogExtensions, isLoading, isLoaded, failedSources, enabledSources, updatedAt } = extensionCatalogService
  const now = useNow()
  const [keyword, setKeyword] = usePageState("browse.keyword", "")
  const [sourceFilter, setSourceFilter] = usePageState("browse.source", ALL_SOURCES)
  const [platform, setPlatform] = usePageState<PlatformFilter>("browse.platform", ALL_PLATFORMS)

  if (enabledSources.length === 0) {
    return (
      <ExtensionsPagePlaceholder
        icon={<Icons.Browse size={28} aria-hidden />}
        title="Every source is turned off"
        description="Turn a catalog source back on, or add a new one."
        action={<Button icon={Icons.Settings} onClick={openExtensionSettings}>Manage Sources</Button>}
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

  const fromSource = catalogExtensions
    .filter((entry) => activeSourceFilter === ALL_SOURCES || entry.sourceId === activeSourceFilter)
  const filteredExtensions = fromSource
    .filter((entry) => platform === ALL_PLATFORMS || getExtensionPlatform(entry.tools.map((tool) => tool.runtime)) === platform)
    .filter((entry) => matchesSearchKeyword(keyword, [
      entry.name,
      entry.description,
      entry.category,
      entry.author,
      ...entry.tools.map((tool) => tool.name)
    ]))

  const renderGrid = () => {
    if (isFirstLoad) {
      return (
        <ExtensionStoreSection>
          {[0, 1, 2, 3, 4, 5].map((index) => <div key={index} className="ExtensionStoreCard is-skeleton" />)}
        </ExtensionStoreSection>
      )
    }

    if (filteredExtensions.length === 0) {
      return (
        <div className="ExtensionStore-empty">
          {keyword.trim()
            ? `Nothing matches "${keyword.trim()}"`
            : platform === ALL_PLATFORMS ? "The enabled sources have no extensions yet" : "No extensions for this platform"}
        </div>
      )
    }

    return (
      <ExtensionStoreSection count={filteredExtensions.length}>
        {filteredExtensions.map((entry) => (
          <ExtensionStoreCard
            key={getCatalogKey(entry)}
            name={entry.name}
            version={entry.version}
            author={[entry.author, hasManySources && extensionCatalogService.getSourceLabel(entry.sourceId)].filter(Boolean).join(" · ")}
            category={entry.category}
            description={entry.description}
            provides={getExtensionProvidesLabels(entry.tools.length, entry.components.length)}
            tag={getCatalogTag(entry)}
            action={extensionCatalogService.getStatus(entry) !== "installed" && <CatalogInstallButton entry={entry} isCompact />}
            onSelect={() => { openExtensionPage(extensionCatalogService.getEntryExtensionId(entry), entry.name) }}
          />
        ))}
      </ExtensionStoreSection>
    )
  }

  return (
    <ExtensionStore
      scrollKey="browse.scroll"
      title="Discover extensions"
      subtitle={isFirstLoad
        ? "Loading the catalog…"
        : (
          <>
            {`${pluralize(catalogExtensions.length, "extension")} from ${pluralize(enabledSources.length, "source")}`}
            {updatedAt !== undefined && (
              <span title={`Catalog read ${prettyDateFormat(new Date(updatedAt))}`}>
                {" · "}{formatCatalogUpdatedLabel(updatedAt, isLoading, now)}
              </span>
            )}
          </>
        )}
      toolbar={(
        <ExtensionsToolbar
          keyword={keyword}
          onKeywordChange={setKeyword}
          sourceFilter={activeSourceFilter}
          onSourceFilterChange={setSourceFilter}
          sourceOptions={enabledSources.map((source) => ({ label: getCatalogSourceLabel(source), value: source.id }))}
        />
      )}
      notices={failedSources.map(({ source, error }) => (
        <CatalogSourceErrorNotice
          key={source.id}
          source={source}
          error={error}
          onManageSources={openExtensionSettings}
        />
      ))}
      platform={platform}
      onPlatformChange={setPlatform}
    >
      {renderGrid()}
    </ExtensionStore>
  )
})

const ALL_PLATFORMS = "all"

type PlatformFilter = typeof ALL_PLATFORMS | ExtensionPlatform

const PLATFORM_FILTERS: Array<{ value: PlatformFilter, label: string, description: string }> = [
  { value: ALL_PLATFORMS, label: "All", description: "Every extension" },
  { value: ExtensionPlatform.Desktop, label: "Desktop", description: "Runs programs, needs the desktop app" },
  { value: ExtensionPlatform.Web, label: "Web", description: "JavaScript only, runs in the browser too" }
]

interface ExtensionStoreProps {
  /**
   * Where its scroll position is kept in the page's state
   */
  scrollKey: string
  title: string
  subtitle: ReactNode
  toolbar: ReactNode

  /**
   * Shown under the toolbar, such as sources that failed to load
   */
  notices?: ReactNode
  platform: PlatformFilter
  onPlatformChange: (platform: PlatformFilter) => void
  children: ReactNode
}

/**
 * Store front: a banner with the search, platform chips, then a grid of
 * cards, all scrolling together
 */
const ExtensionStore: FC<ExtensionStoreProps> = (props) => {
  const { scrollKey, title, subtitle, toolbar, notices, platform, onPlatformChange, children } = props
  const scrollRef = usePageScroll(scrollKey)

  return (
    <div className="ExtensionsPage-scrollArea">
      <SimpleBar key={scrollKey} className="ExtensionsPage-scroll" scrollableNodeProps={{ ref: scrollRef }}>
        <div className="ExtensionStore">
          <div className="ExtensionStore-banner">
            <div className="ExtensionStore-heading">
              <h2 className="ExtensionStore-title">{title}</h2>
              <div className="ExtensionStore-subtitle">{subtitle}</div>
            </div>
            <div className="ExtensionStore-toolbar">{toolbar}</div>
          </div>

          {notices}

          <div className="ExtensionStore-categories" role="radiogroup" aria-label="Platform">
            {PLATFORM_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="radio"
                title={item.description}
                aria-checked={item.value === platform}
                className={clsx("ExtensionStore-category", item.value === platform && "active")}
                onClick={() => { onPlatformChange(item.value) }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {children}
        </div>
      </SimpleBar>
    </div>
  )
}

interface ExtensionStoreSectionProps {
  title?: string
  count?: number
  children: ReactNode
}

const ExtensionStoreSection: FC<ExtensionStoreSectionProps> = ({ title, count, children }) => (
  <section className="ExtensionStore-section">
    {title && (
      <div className="ExtensionStore-sectionTitle">
        {title}
        {count !== undefined && <span>{count}</span>}
      </div>
    )}
    <div className="ExtensionStore-grid">{children}</div>
  </section>
)
