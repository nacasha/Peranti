import { observer } from "mobx-react"
import { useEffect, useState, type FC } from "react"
import toast from "react-hot-toast"

import { Button } from "src/components/common/Button"
import { Checkbox } from "src/components/common/Checkbox"
import { PopoverConfirm } from "src/components/common/PopoverConfirm"
import { Icons } from "src/constants/icons"
import { ExtensionRuntime } from "src/enums/extension-runtime"
import { appletStore } from "src/services/applet-store"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { extensionsService } from "src/services/extensions-service"
import { fileService } from "src/services/file-service"
import { sessionStore } from "src/services/session-store"
import { type CatalogExtensionFile } from "src/types/CatalogExtension"
import { type InstalledExtension, type InstalledExtensionTool } from "src/types/InstalledExtension"
import { getExtensionProvidesLabels } from "src/utils/get-extension-provides-labels"
import { getExtensionToolRuns } from "src/utils/get-extension-tool-runs"
import { getRuntimeSummary } from "src/utils/get-runtime-summary"
import { installCatalogExtension } from "src/utils/install-catalog-extension"
import { prettyDateFormat } from "src/utils/pretty-date-format"

import { ExtensionComponentsSection } from "./ExtensionComponentsSection.tsx"
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
  // One tool reads like a tool, several get their own blocks
  const isPackage = tools.length > 1
  // A package opens each tool from its own block below
  const firstTool = tools[0] as InstalledExtensionTool | undefined
  const singleTool = !isPackage && isEnabled ? firstTool : undefined
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
      const message = exception instanceof Error ? exception.message : String(exception)
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
  const componentItems = extension.components.map(({ definition, path }) => ({ ...definition, path }))

  const runtimeLabel = getRuntimeSummary(tools.map((tool) => tool.definition.runtime))
  const onlyDefinition = isPackage ? undefined : firstTool?.definition
  const runs = onlyDefinition && getExtensionToolRuns(onlyDefinition)

  return (
    <ExtensionDetails
      name={name}
      version={manifest?.version}
      author={manifest?.author}
      provides={getExtensionProvidesLabels(tools.length, extension.components.length)}
      chips={[runtimeLabel, manifest?.category, !isEnabled && "Disabled"]}
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

          {singleTool && (
            <Button
              icon={Icons.OpenInNewTab}
              onClick={() => { sessionStore.findOrCreateSession(singleTool.appletConstructor) }}
            >
              Open Tool
            </Button>
          )}

          <Button icon={Icons.Folder} onClick={handleReveal}>Show in Folder</Button>

          <PopoverConfirm
            placement="bottomLeft"
            confirmation={() => ({
              title: `Uninstall ${name}?`,
              description: "Its folder is deleted from disk, and its open tabs are closed",
              confirmLabel: "Uninstall",
              variant: "danger"
            })}
            onConfirm={() => { void handleUninstall() }}
          >
            <Button icon={Icons.Trash}>Uninstall</Button>
          </PopoverConfirm>

          <label className="ExtensionDetails-toggle">
            <Checkbox value={isEnabled} onChange={handleToggle} />
            {isEnabled ? "Enabled" : "Disabled"}
          </label>
        </>
      )}
      fields={[
        { label: "Tool ID", value: onlyDefinition && <code>{onlyDefinition.toolId}</code> },
        { label: "Extension ID", value: <code>{extension.id}</code> },
        isPackage && { label: "Tools", value: tools.length },
        { label: "Version", value: manifest?.version },
        { label: "Runtime", value: runtimeLabel },
        !!runs && {
          label: onlyDefinition?.runtime === ExtensionRuntime.Executable ? "Command" : "Entry",
          value: <code>{runs}</code>
        },
        { label: "Category", value: manifest?.category },
        { label: "Source", value: source ? source.catalog : "Added by hand" },
        source && { label: "Installed", value: prettyDateFormat(new Date(source.installedAt)) },
        {
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
          content: <ExtensionToolsSection tools={toolItems} />
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
