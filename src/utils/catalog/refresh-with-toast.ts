import toast from "react-hot-toast"

import { CatalogSourceType } from "src/enums/catalog-source-type"
import { appletStore } from "src/services/applet-store"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { extensionsService } from "src/services/extensions-service"
import { type CatalogSource } from "src/types/CatalogSource"
import { getErrorMessage } from "src/utils/common/get-error-message"

/**
 * One toast for every reload or refresh, replaced when another starts
 */
const TOAST_ID = "extensions-refresh"

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`
}

/**
 * Sources whose last read failed, with the error. A failed source keeps
 * showing what it had, so the failure only shows in its state.
 */
function getFailedSources(sources: CatalogSource[]) {
  return sources
    .map((source) => ({ source, error: extensionCatalogService.sourceStates[source.id]?.error }))
    .filter((failed): failed is { source: CatalogSource, error: string } => Boolean(failed.error))
}

function reportFailedSources(failed: Array<{ source: CatalogSource, error: string }>, prefix = "") {
  const labels = failed.map(({ source }) => extensionCatalogService.getSourceLabel(source.id))
  const message = failed.length === 1
    ? `${prefix}Couldn't refresh ${labels[0]}: ${failed[0].error}`
    : `${prefix}Couldn't refresh ${plural(failed.length, "source")}: ${labels.join(", ")}`

  toast.error(message, { id: TOAST_ID })
}

/**
 * Reload installed and linked extensions, reporting the outcome in a toast
 */
export async function reloadExtensionsWithToast() {
  toast.loading("Reloading extensions…", { id: TOAST_ID })

  try {
    await appletStore.reloadExtensions()
    toast.success(`Reloaded ${plural(extensionsService.installedExtensions.length, "extension")}`, { id: TOAST_ID })
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

  const failed = getFailedSources([source])
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
  toast.success(`Refreshed ${label}, ${plural(count, "extension")}`, { id: TOAST_ID })
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

  const failed = getFailedSources(sources)
  if (failed.length > 0) {
    reportFailedSources(failed)
    return
  }

  toast.success(`Refreshed ${plural(sources.length, "source")}`, { id: TOAST_ID })
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

  const failed = getFailedSources(sources)
  if (failed.length > 0) {
    const refreshedCount = sources.length - failed.length
    reportFailedSources(failed, refreshedCount > 0 ? `Refreshed ${plural(refreshedCount, "source")}. ` : "")
    return
  }

  const hasLocal = sources.length > extensionCatalogService.remoteSources.length
  toast.success(
    hasLocal
      ? `Refreshed ${plural(sources.length, "source")} and reloaded extensions`
      : `Refreshed ${plural(sources.length, "source")}`,
    { id: TOAST_ID }
  )
}
