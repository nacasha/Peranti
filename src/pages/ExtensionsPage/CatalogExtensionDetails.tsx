import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { PopoverConfirm } from "src/components/common/PopoverConfirm"
import { Tooltip } from "src/components/common/Tooltip"
import { Icons } from "src/constants/icons"
import { ExtensionRuntime } from "src/enums/extension-runtime"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { sessionStore } from "src/services/session-store"
import { type CatalogExtension } from "src/types/CatalogExtension"
import { formatFileSize } from "src/utils/format-file-size"
import { getCatalogEntryTools } from "src/utils/get-catalog-entry-tools"
import { getExtensionProvidesLabels } from "src/utils/get-extension-provides-labels"
import { getRuntimeSummary } from "src/utils/get-runtime-summary"
import { installCatalogExtension } from "src/utils/install-catalog-extension"
import { isRunningInTauri } from "src/utils/is-running-in-tauri"

import { ExtensionComponentsSection } from "./ExtensionComponentsSection.tsx"
import { ExtensionDetails, ExtensionDetailsNotice } from "./ExtensionDetails.tsx"
import { ExtensionFilesExplorer } from "./ExtensionFilesExplorer.tsx"
import { ExtensionProvidesSection } from "./ExtensionProvidesSection.tsx"
import { ExtensionToolsSection } from "./ExtensionToolsSection.tsx"

interface CatalogExtensionDetailsProps {
  entry: CatalogExtension
}

/**
 * Details of a catalog extension, with the button to install or update it
 */
export const CatalogExtensionDetails: FC<CatalogExtensionDetailsProps> = observer(({ entry }) => {
  const status = extensionCatalogService.getStatus(entry)
  const installed = extensionCatalogService.getInstalled(entry)
  const isInstalling = extensionCatalogService.isInstalling(extensionCatalogService.getEntryExtensionId(entry))
  const isUpdate = status === "update-available"
  const totalBytes = entry.files?.reduce((total, file) => total + file.size, 0)
  const tools = getCatalogEntryTools(entry)
  // One tool reads like a tool, several get their own blocks
  const isPackage = tools.length > 1

  // Every program the extension starts, each named once
  const commands = [...new Set(tools
    .filter((tool) => tool.runtime === ExtensionRuntime.Executable)
    .map((tool) => tool.command ?? "a program"))]
  const isExecutable = commands.length > 0

  // Opening needs the installed copy, which may list other tools after an update
  const canOpen = status === "installed" || isUpdate
  const getInstalledTool = (toolId: string) => installed?.tools.find((tool) => tool.definition.toolId === toolId)
  const singleInstalledTool = !isPackage && canOpen ? installed?.tools[0] : undefined

  const handleInstall = () => {
    void installCatalogExtension(entry, isUpdate)
  }

  /**
   * Only a new executable asks first, an update keeps the trust already given
   */
  const getInstallConfirmation = () => {
    if (!isExecutable || isUpdate) {
      return undefined
    }

    return {
      title: `Install ${entry.name}?`,
      description: `This extension runs ${commands.map((command) => `"${command}"`).join(", ")} on your computer. Only install extensions you trust.`,
      confirmLabel: "Install"
    }
  }

  const renderInstallButton = () => {
    if (!isRunningInTauri) {
      return (
        <Tooltip overlay="Installing extensions needs the desktop app">
          <span><Button icon={Icons.Download} disabled>Install</Button></span>
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
          <span><Button disabled>Name Conflict</Button></span>
        </Tooltip>
      )
    }

    return (
      <PopoverConfirm
        placement="bottomLeft"
        confirmation={getInstallConfirmation}
        onConfirm={handleInstall}
      >
        <Button icon={Icons.Download} variant="primary" onClick={handleInstall}>
          {isUpdate ? `Update to v${entry.version}` : "Install"}
        </Button>
      </PopoverConfirm>
    )
  }

  const toolItems = tools.map((tool) => {
    const installedTool = canOpen ? getInstalledTool(tool.toolId) : undefined

    return {
      toolId: tool.toolId,
      name: tool.name,
      description: tool.description,
      runtime: tool.runtime,
      runs: tool.command,
      path: tool.path,
      inputFields: tool.inputFields,
      outputFields: tool.outputFields,
      onOpen: installedTool && (() => { sessionStore.findOrCreateSession(installedTool.appletConstructor) })
    }
  })
  const componentItems = entry.components ?? []

  const runtimeLabel = getRuntimeSummary(tools.map((tool) => tool.runtime))

  return (
    <ExtensionDetails
      name={entry.name}
      version={entry.version}
      author={entry.author}
      provides={getExtensionProvidesLabels(tools.length, entry.components?.length ?? 0)}
      chips={[runtimeLabel, entry.category]}
      notice={isExecutable && (
        <ExtensionDetailsNotice tone="warning" title="Runs a program on your computer">
          This extension starts {commands.map((command, index) => (
            <span key={command}>{index > 0 && ", "}<code>{command}</code></span>
          ))} each time it runs. Only install extensions you trust.
        </ExtensionDetailsNotice>
      )}
      description={entry.description}
      actions={(
        <>
          {renderInstallButton()}
          {singleInstalledTool && (
            <Button
              icon={Icons.OpenInNewTab}
              onClick={() => { sessionStore.findOrCreateSession(singleInstalledTool.appletConstructor) }}
            >
              Open Tool
            </Button>
          )}
        </>
      )}
      fields={[
        !isPackage && { label: "Tool ID", value: <code>{tools[0].toolId}</code> },
        { label: "Extension ID", value: <code>{extensionCatalogService.getEntryExtensionId(entry)}</code> },
        isPackage && { label: "Tools", value: tools.length },
        { label: "Version", value: entry.version },
        !!installed?.manifest?.version && { label: "Installed", value: `v${installed.manifest.version}` },
        { label: "Runtime", value: runtimeLabel },
        !isPackage && !!tools[0].command && { label: "Command", value: <code>{tools[0].command}</code> },
        { label: "Category", value: entry.category },
        { label: "Source", value: extensionCatalogService.getSourceLabel(entry.sourceId) },
        !!entry.files && { label: "Size", value: formatFileSize(totalBytes ?? 0) }
      ]}
      tabs={[
        {
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
          count: entry.files?.length,
          isFill: true,
          content: (
            <ExtensionFilesExplorer
              files={entry.files}
              placeholder="This catalog's index doesn't list files, rebuild it with build-index.mjs"
              readFile={async(file) => await extensionCatalogService.readCatalogFile(entry, file)}
            />
          )
        }
      ]}
    >
      <ExtensionProvidesSection tools={toolItems} components={componentItems} />
    </ExtensionDetails>
  )
})
