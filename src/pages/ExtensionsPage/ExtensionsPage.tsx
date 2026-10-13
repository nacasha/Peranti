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
import { useNow } from "src/hooks/useNow"
import { usePageScroll } from "src/hooks/usePageScroll"
import { usePageState } from "src/hooks/usePageState"
import { appletStore } from "src/services/applet-store"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { extensionsPageStore, type ExtensionsPageTab } from "src/services/extensions-page-store"
import { extensionsService } from "src/services/extensions-service"
import { sessionStore } from "src/services/session-store"
import { settingsPageStore } from "src/services/settings-page-store"
import { type CatalogExtension } from "src/types/CatalogExtension"
import { type InstalledExtension } from "src/types/InstalledExtension"
import { formatCatalogUpdatedLabel } from "src/utils/catalog/format-catalog-updated-label"
import { getCatalogSourceLabel } from "src/utils/catalog/get-catalog-source-label"
import { getInstalledSourceFilter } from "src/utils/catalog/get-installed-source-filter"
import { isRunningInTauri } from "src/utils/common/is-running-in-tauri"
import { getExtensionProvidesLabels } from "src/utils/extension/get-extension-provides-labels"
import { openExtensionPage } from "src/utils/extension/open-extension-page"
import { matchesSearchKeyword } from "src/utils/search/matches-search-keyword"
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
        {activeTab === "installed" && <InstalledTab onOpenFolder={handleOpenFolder} />}
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

/**
 * Categories present in a list, sorted, each once
 */
const getCategories = (categories: Array<string | undefined>) => (
  [...new Set(categories.filter((category): category is string => !!category))].sort((a, b) => a.localeCompare(b))
)

const InstalledTab: FC<{ onOpenFolder: () => void }> = observer(({ onOpenFolder }) => {
  const { installedExtensions } = extensionsService
  const [keyword, setKeyword] = usePageState("installed.keyword", "")
  const [sourceFilter, setSourceFilter] = usePageState("installed.source", ALL_SOURCES)
  const [category, setCategory] = usePageState("installed.category", ALL_CATEGORIES)

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
        description={`Install one from Discover, or place a folder with a ${FileNames.ExtensionDefinition} file in the extensions folder.`}
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
  const fromSource = installedExtensions
    .filter((extension) => activeSourceFilter === ALL_SOURCES || getInstalledSourceFilter(extension) === activeSourceFilter)
  const categories = getCategories(fromSource.map((extension) => extension.manifest?.category))
  const activeCategory = categories.includes(category) ? category : ALL_CATEGORIES

  const filteredExtensions = fromSource
    .filter((extension) => activeCategory === ALL_CATEGORIES || extension.manifest?.category === activeCategory)
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
      categories={categories}
      category={activeCategory}
      onCategoryChange={setCategory}
    >
      {filteredExtensions.length === 0 && (
        <div className="ExtensionStore-empty">{`Nothing matches "${keyword.trim()}"`}</div>
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
  const [category, setCategory] = usePageState("browse.category", ALL_CATEGORIES)

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
  const categories = getCategories(fromSource.map((entry) => entry.category))
  const activeCategory = categories.includes(category) ? category : ALL_CATEGORIES

  const filteredExtensions = fromSource
    .filter((entry) => activeCategory === ALL_CATEGORIES || entry.category === activeCategory)
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
          {keyword.trim() ? `Nothing matches "${keyword.trim()}"` : "The enabled sources have no extensions yet"}
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
            {`${catalogExtensions.length} extension${catalogExtensions.length === 1 ? "" : "s"} from ${enabledSources.length} source${enabledSources.length === 1 ? "" : "s"}`}
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
      categories={categories}
      category={activeCategory}
      onCategoryChange={setCategory}
    >
      {renderGrid()}
    </ExtensionStore>
  )
})

const ALL_CATEGORIES = "all"

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
  categories: string[]
  category: string
  onCategoryChange: (category: string) => void
  children: ReactNode
}

/**
 * Store front: a banner with the search, category chips, then a grid of
 * cards, all scrolling together
 */
const ExtensionStore: FC<ExtensionStoreProps> = (props) => {
  const { scrollKey, title, subtitle, toolbar, notices, categories, category, onCategoryChange, children } = props
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

          {categories.length > 0 && (
            <div className="ExtensionStore-categories" role="radiogroup" aria-label="Category">
              {[ALL_CATEGORIES, ...categories].map((item) => (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={item === category}
                  className={clsx("ExtensionStore-category", item === category && "active")}
                  onClick={() => { onCategoryChange(item) }}
                >
                  {item === ALL_CATEGORIES ? "All" : item}
                </button>
              ))}
            </div>
          )}

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
