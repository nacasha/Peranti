import toast from "react-hot-toast"

import { extensionCatalogService } from "src/services/extension-catalog-service"
import { type CatalogExtension } from "src/types/CatalogExtension"

/**
 * Install or update a catalog extension, reporting the outcome in a toast
 */
export async function installCatalogExtension(entry: CatalogExtension, isUpdate: boolean = false) {
  const toastId = `extension-install-${entry.id}`

  try {
    await extensionCatalogService.install(entry)
    toast.success(`${isUpdate ? "Updated" : "Installed"} ${entry.name} ${entry.version}`, { id: toastId })
  } catch (exception) {
    const message = exception instanceof Error ? exception.message : String(exception)
    toast.error(`Failed to ${isUpdate ? "update" : "install"} ${entry.name}: ${message}`, { id: toastId })
  }
}
