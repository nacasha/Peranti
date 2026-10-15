import { observer } from "mobx-react"
import { useEffect, useState, type FC } from "react"
import toast from "react-hot-toast"

import { Button } from "src/components/common/Button"
import { Checkbox } from "src/components/common/Checkbox"
import { PopoverConfirm } from "src/components/common/PopoverConfirm"
import { Icons } from "src/constants/icons"
import { appletStore } from "src/services/applet-store"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { extensionsService } from "src/services/extensions-service"
import { fileService } from "src/services/file-service"
import { sessionStore } from "src/services/session-store"
import { type CatalogExtensionFile } from "src/types/CatalogExtension"
import { type InstalledExtension } from "src/types/InstalledExtension"
import { installCatalogExtension } from "src/utils/catalog/install-catalog-extension"
import { getErrorMessage } from "src/utils/common/get-error-message"
import { isRunningInTauri } from "src/utils/common/is-running-in-tauri"
import { openComponentInWorkbench } from "src/utils/component/open-component-in-workbench"
import { getExtensionProvidesLabels } from "src/utils/extension/get-extension-provides-labels"
import { getExtensionToolRuns } from "src/utils/extension/get-extension-tool-runs"
import { getRuntimeSummary } from "src/utils/extension/get-runtime-summary"
import { prettyDateFormat } from "src/utils/time/pretty-date-format"

import { ExtensionComponentsSection, type ExtensionComponentsSectionItem } from "./ExtensionComponentsSection.tsx"
import { ExtensionDetails, ExtensionDetailsNotice } from "./ExtensionDetails.tsx"
import { ExtensionFilesExplorer } from "./ExtensionFilesExplorer.tsx"
import { ExtensionProvidesSection } from "./ExtensionProvidesSection.tsx"
import { ExtensionToolsSection } from "./ExtensionToolsSection.tsx"

interface InstalledExtensionDetailsProps {
  extension: InstalledExtension
}

/**
 * Details and actions of an installed extension
 */
export const InstalledExtensionDetails: FC<InstalledExtensionDetailsProps> = observer(({ extension }) => {
  const { manifest, tools, error, folderName, folderPath, source } = extension
  const name = manifest?.name ?? folderName
  const isEnabled = extensionsService.isEnabled(extension)
  const update = extensionCatalogService.getUpdate(extension)
  const isUpdating = extensionCatalogService.isInstalling(extension.id)
  const [files, setFiles] = useState<CatalogExtensionFile[]>()
  const [filesError, setFilesError] = useState<string>()

  // Read again after an update, which keeps the folder path
  const installedAt = source?.installedAt
  useEffect(() => {
    let isCurrent = true
    setFiles(undefined)
    setFilesError(undefined)

    extensionCatalogService.listFolderFiles(folderPath)
      .then((result) => { if (isCurrent) setFiles(result) })
      .catch((exception: unknown) => { if (isCurrent) setFilesError(String(exception)) })

    return () => { isCurrent = false }
  }, [folderPath, installedAt])

  const handleToggle = (enabled: boolean) => {
    extensionsService.setEnabled(extension, enabled)
    void appletStore.reloadExtensions()
  }

  const handleReveal = () => {
    void fileService.openPathInFileManager(folderPath)
  }

  const handleUninstall = async() => {
    try {
      await extensionsService.uninstall(extension)
      await appletStore.reloadExtensions()
      toast.success(`Uninstalled ${name}`)
    } catch (exception) {
      const message = getErrorMessage(exception)
      toast.error(`Failed to uninstall ${folderName}: ${message}`)
    }
  }

  const toolItems = tools.map(({ definition, path, appletConstructor }) => ({
    path,
    toolId: definition.toolId,
    name: definition.name,
    description: definition.description,
    runtime: definition.runtime,
    runs: getExtensionToolRuns(definition),
    inputFields: definition.inputFields,
    outputFields: definition.outputFields,
    onOpen: isEnabled ? () => { sessionStore.findOrCreateSession(appletConstructor) } : undefined
  }))
  const componentItems: ExtensionComponentsSectionItem[] = extension.components.map(({ definition, path, key }) => ({
    ...definition,
    path,
    // Only loaded components are in the playground
    onOpen: isEnabled && tools.length > 0 ? () => { openComponentInWorkbench(key) } : undefined
  }))

  const runtimeLabel = getRuntimeSummary(tools.map((tool) => tool.definition.runtime))

  return (
    <ExtensionDetails
      name={name}
      version={manifest?.version}
      author={manifest?.author}
      provides={getExtensionProvidesLabels(tools.length, extension.components.length)}
      chips={[runtimeLabel, manifest?.category, !!extension.linkedSourceId && "Linked", !isEnabled && "Disabled"]}
      notice={error && (
        <ExtensionDetailsNotice tone="danger" title="This extension failed to load">
          {error}
        </ExtensionDetailsNotice>
      )}
      description={manifest?.description}
      actions={(
        <>
          {update && (
            <Button
              icon={Icons.Download}
              variant="primary"
              disabled={isUpdating}
              onClick={() => { void installCatalogExtension(update, true) }}
            >
              {isUpdating ? "Updating…" : `Update to v${update.version}`}
            </Button>
          )}

          {isRunningInTauri && <Button icon={Icons.Folder} onClick={handleReveal}>Show in Folder</Button>}

          {/* A linked folder belongs to its source, it's never deleted from here */}
          {!extension.linkedSourceId && (
            <PopoverConfirm
              placement="bottomLeft"
              confirmation={() => ({
                title: `Uninstall ${name}?`,
                description: isRunningInTauri
                  ? "Its folder is deleted from disk, and its open tabs are closed"
                  : "It's removed from this browser, and its open tabs are closed",
                confirmLabel: "Uninstall",
                variant: "danger"
              })}
              onConfirm={() => { void handleUninstall() }}
            >
              <Button icon={Icons.Trash}>Uninstall</Button>
            </PopoverConfirm>
          )}

          <label className="ExtensionDetails-toggle">
            <Checkbox value={isEnabled} onChange={handleToggle} />
            {isEnabled ? "Enabled" : "Disabled"}
          </label>
        </>
      )}
      fields={[
        { label: "Extension ID", value: <code>{extension.id}</code> },
        { label: "Version", value: manifest?.version },
        { label: "Runtime", value: runtimeLabel },
        { label: "Category", value: manifest?.category },
        {
          label: "Source",
          value: extension.linkedSourceId
            ? `Linked from ${extensionCatalogService.getInstalledSourceLabel(extension)}`
            : source ? source.catalog : "Added by hand"
        },
        source && { label: "Installed", value: prettyDateFormat(new Date(source.installedAt)) },
        isRunningInTauri && {
          label: "Folder",
          value: (
            <button type="button" className="ExtensionDetails-path" title="Show in Folder" onClick={handleReveal}>
              {folderPath}
            </button>
          )
        }
      ]}
      tabs={[
        toolItems.length > 0 && {
          id: "tools",
          label: "Tools",
          count: toolItems.length,
          content: <ExtensionToolsSection tools={toolItems} components={componentItems} />
        },
        componentItems.length > 0 && {
          id: "components",
          label: "Components",
          count: componentItems.length,
          content: <ExtensionComponentsSection components={componentItems} />
        },
        {
          id: "files",
          label: "Files",
          count: files?.length,
          isFill: true,
          content: (
            <ExtensionFilesExplorer
              files={files}
              placeholder={filesError ? `Couldn't read the folder: ${filesError}` : "Reading files…"}
              readFile={async(file) => await extensionCatalogService.readInstalledFile(folderPath, file.path)}
            />
          )
        }
      ]}
    >
      <ExtensionProvidesSection tools={toolItems} components={componentItems} />
    </ExtensionDetails>
  )
})
