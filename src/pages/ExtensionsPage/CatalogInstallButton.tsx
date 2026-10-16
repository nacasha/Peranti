import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { PopoverConfirm } from "src/components/common/PopoverConfirm"
import { Tooltip } from "src/components/common/Tooltip"
import { Icons } from "src/constants/icons"
import { ExtensionRuntime } from "src/enums/extension-runtime"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { type CatalogExtension } from "src/types/CatalogExtension"
import { installCatalogExtension } from "src/utils/catalog/catalog-toasts"
import { isRunningInTauri } from "src/utils/common/is-running-in-tauri"

interface CatalogInstallButtonProps {
  entry: CatalogExtension

  /**
   * Shorter labels for a store card, "Update" instead of "Update to v1.2.0"
   */
  isCompact?: boolean
}

/**
 * Install, update or the reason it can't, for a catalog extension. A new
 * extension that runs a program asks first.
 */
export const CatalogInstallButton: FC<CatalogInstallButtonProps> = observer(({ entry, isCompact }) => {
  const status = extensionCatalogService.getStatus(entry)
  const isInstalling = extensionCatalogService.isInstalling(extensionCatalogService.getEntryExtensionId(entry))
  const isUpdate = status === "update-available"

  // Every program the extension starts, each named once
  const commands = [...new Set(entry.tools
    .filter((tool) => tool.runtime === ExtensionRuntime.Executable)
    .map((tool) => tool.command ?? "a program"))]

  const handleInstall = () => {
    void installCatalogExtension(entry, isUpdate)
  }

  /**
   * Only a new executable asks first, an update keeps the trust already given
   */
  const getInstallConfirmation = () => {
    if (commands.length === 0 || isUpdate) {
      return undefined
    }

    return {
      title: `Install ${entry.name}?`,
      description: `This extension runs ${commands.map((command) => `"${command}"`).join(", ")} on your computer. Only install extensions you trust.`,
      confirmLabel: "Install"
    }
  }

  if (!isRunningInTauri && extensionCatalogService.needsDesktopApp(entry)) {
    return (
      <Tooltip overlay="Its tools run programs on your computer, install it in the desktop app">
        <span><Button icon={Icons.Download} disabled>{isCompact ? "Desktop Only" : "Desktop App Only"}</Button></span>
      </Tooltip>
    )
  }

  if (isInstalling) {
    return <Button variant="primary" disabled>{isUpdate ? "Updating…" : "Installing…"}</Button>
  }

  if (status === "installed") {
    return <Button icon={Icons.Check} disabled>Installed</Button>
  }

  if (status === "conflict") {
    return (
      <Tooltip overlay="A folder added by hand already uses the name this extension installs into">
        <span><Button disabled>{isCompact ? "Conflict" : "Name Conflict"}</Button></span>
      </Tooltip>
    )
  }

  const label = isUpdate ? (isCompact ? "Update" : `Update to v${entry.version}`) : "Install"

  return (
    <PopoverConfirm
      placement="bottomLeft"
      confirmation={getInstallConfirmation}
      onConfirm={handleInstall}
    >
      <Button icon={Icons.Download} variant="primary" onClick={handleInstall}>
        {label}
      </Button>
    </PopoverConfirm>
  )
})
