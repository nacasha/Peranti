import { observer } from "mobx-react"
import { useEffect, type FC } from "react"

import { Icons } from "src/constants/icons"
import { PageStateProvider } from "src/contexts/PageStateContext"
import { CatalogExtensionDetails } from "src/pages/ExtensionsPage/CatalogExtensionDetails.tsx"
// Same card frame and details styles as the extensions page
import "src/pages/ExtensionsPage/ExtensionsPage.scss"
import { ExtensionsPagePlaceholder } from "src/pages/ExtensionsPage/ExtensionsPagePlaceholder.tsx"
import { InstalledExtensionDetails } from "src/pages/ExtensionsPage/InstalledExtensionDetails.tsx"
import { appletStore } from "src/services/applet-store"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { extensionsService } from "src/services/extensions-service"

interface ExtensionPageProps {
  extensionId: string

  /**
   * State of the page kept in its tab, see `PageStateProvider`
   */
  initialState?: unknown
  onStateChange?: (state: Record<string, unknown>) => void
}

/**
 * One extension in a tab of its own. Shows the installed copy when there is
 * one, else the catalog entry with its Install button, so the tab follows
 * the extension through an install or an uninstall.
 */
export const ExtensionPage: FC<ExtensionPageProps> = observer(({ extensionId, initialState, onStateChange }) => {
  const { isLoaded, isLoading } = extensionCatalogService
  const installed = extensionsService.installedExtensions.find((extension) => extension.id === extensionId)
  const entry = installed
    ? undefined
    : extensionCatalogService.catalogExtensions.find((item) => extensionCatalogService.getEntryExtensionId(item) === extensionId)

  // A tab restored at start up may need the catalog for its entry
  useEffect(() => {
    void extensionCatalogService.loadCatalog()
  }, [])

  // Keeps the tab's title in step with the extension's name
  const name = installed ? (installed.manifest?.name ?? installed.folderName) : entry?.name
  useEffect(() => {
    if (name) {
      appletStore.registerExtensionPage(extensionId, name)
    }
  }, [extensionId, name])

  const renderContent = () => {
    if (installed) {
      return <InstalledExtensionDetails key={installed.folderName} extension={installed} />
    }

    if (entry) {
      return <CatalogExtensionDetails key={extensionId} entry={entry} />
    }

    if (!isLoaded || isLoading) {
      return (
        <ExtensionsPagePlaceholder
          icon={<Icons.Extensions size={28} aria-hidden />}
          title="Loading extension…"
          description="Looking for it in the extensions folder and the catalogs."
        />
      )
    }

    return (
      <ExtensionsPagePlaceholder
        icon={<Icons.Warning size={28} aria-hidden />}
        title="Extension not found"
        description={`"${extensionId}" isn't installed, and no enabled catalog source lists it.`}
      />
    )
  }

  return (
    <PageStateProvider initialState={initialState} onStateChange={onStateChange}>
      <div className="ExtensionsPage ExtensionPage">
        <div className="ExtensionsPage-detailsPane">
          {renderContent()}
        </div>
      </div>
    </PageStateProvider>
  )
})
