import toast from "react-hot-toast"

import { CatalogSourceType } from "src/enums/catalog-source-type"
import { appletStore } from "src/services/applet-store"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { extensionsService } from "src/services/extensions-service"
import { type CatalogExtension } from "src/types/CatalogExtension"
import { type CatalogSource } from "src/types/CatalogSource"
import { getErrorMessage } from "src/utils/common/get-error-message"
import { pluralize } from "src/utils/text/pluralize"

/**
 * Catalog and extension actions started from the UI, each reporting its
 * outcome in a toast
 */

/**
 * One toast for every reload or refresh, replaced when another starts
 */
const TOAST_ID = "extensions-refresh"

/**
 * One toast per extension being installed, followed by its outcome
 */
const INSTALL_TOAST_ID_PREFIX = "extension-install-"

/**
 * Install or update a catalog extension, reporting the outcome in a toast
 */
export async function installCatalogExtension(entry: CatalogExtension, isUpdate: boolean = false) {
  const toastId = INSTALL_TOAST_ID_PREFIX + entry.id

  try {
    await extensionCatalogService.install(entry)
    toast.success(`${isUpdate ? "Updated" : "Installed"} ${entry.name} ${entry.version}`, { id: toastId })
  } catch (exception) {
    const message = getErrorMessage(exception)
    toast.error(`Failed to ${isUpdate ? "update" : "install"} ${entry.name}: ${message}`, { id: toastId })
  }
}

function reportFailedSources(failed: Array<{ source: CatalogSource, error: string }>, prefix = "") {
  const labels = failed.map(({ source }) => extensionCatalogService.getSourceLabel(source.id))
  const message = failed.length === 1
    ? `${prefix}Couldn't refresh ${labels[0]}: ${failed[0].error}`
    : `${prefix}Couldn't refresh ${pluralize(failed.length, "source")}: ${labels.join(", ")}`

  toast.error(message, { id: TOAST_ID })
}

/**
 * Reload installed and linked extensions, reporting the outcome in a toast
 */
export async function reloadExtensionsWithToast() {
  toast.loading("Reloading extensions…", { id: TOAST_ID })

  try {
    await appletStore.reloadExtensions()
    toast.success(`Reloaded ${pluralize(extensionsService.installedExtensions.length, "extension")}`, { id: TOAST_ID })
  } catch (exception) {
    toast.error(`Couldn't reload extensions: ${getErrorMessage(exception)}`, { id: TOAST_ID })
  }
}

/**
 * Read one catalog source again, reporting the outcome in a toast. A local
 * source reloads the extensions, since its folders load with them.
 */
export async function refreshSourceWithToast(source: CatalogSource) {
  const label = extensionCatalogService.getSourceLabel(source.id)
  toast.loading(`Refreshing ${label}…`, { id: TOAST_ID })

  try {
    await extensionCatalogService.refreshSource(source)
  } catch (exception) {
    toast.error(`Couldn't refresh ${label}: ${getErrorMessage(exception)}`, { id: TOAST_ID })
    return
  }

  const failed = extensionCatalogService.getFailedSources([source])
  if (failed.length > 0) {
    reportFailedSources(failed)
    return
  }

  // A local source isn't listed again, its extensions were reloaded instead
  if (source.type === CatalogSourceType.Local) {
    toast.success(`Reloaded extensions from ${label}`, { id: TOAST_ID })
    return
  }

  const count = extensionCatalogService.sourceStates[source.id]?.extensions.length ?? 0
  toast.success(`Refreshed ${label}, ${pluralize(count, "extension")}`, { id: TOAST_ID })
}

/**
 * Read the remote catalog sources again, reporting the outcome in a toast
 */
export async function refreshCatalogWithToast() {
  const sources = extensionCatalogService.remoteSources
  toast.loading("Refreshing catalog…", { id: TOAST_ID })

  try {
    await extensionCatalogService.loadCatalog(true)
  } catch (exception) {
    toast.error(`Couldn't refresh the catalog: ${getErrorMessage(exception)}`, { id: TOAST_ID })
    return
  }

  const failed = extensionCatalogService.getFailedSources(sources)
  if (failed.length > 0) {
    reportFailedSources(failed)
    return
  }

  toast.success(`Refreshed ${pluralize(sources.length, "source")}`, { id: TOAST_ID })
}

/**
 * Read every enabled source again and reload the extensions when a local one
 * is among them, reporting the outcome of both in a toast
 */
export async function refreshAllSourcesWithToast() {
  const sources = extensionCatalogService.enabledSources
  toast.loading("Refreshing sources…", { id: TOAST_ID })

  try {
    await extensionCatalogService.refreshAllSources()
  } catch (exception) {
    toast.error(`Couldn't refresh sources: ${getErrorMessage(exception)}`, { id: TOAST_ID })
    return
  }

  const failed = extensionCatalogService.getFailedSources(sources)
  if (failed.length > 0) {
    const refreshedCount = sources.length - failed.length
    reportFailedSources(failed, refreshedCount > 0 ? `Refreshed ${pluralize(refreshedCount, "source")}. ` : "")
    return
  }

  const hasLocal = sources.length > extensionCatalogService.remoteSources.length
  toast.success(
    hasLocal
      ? `Refreshed ${pluralize(sources.length, "source")} and reloaded extensions`
      : `Refreshed ${pluralize(sources.length, "source")}`,
    { id: TOAST_ID }
  )
}
