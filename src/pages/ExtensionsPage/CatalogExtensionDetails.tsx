import { observer } from "mobx-react"
import { type FC } from "react"

import { ExtensionRuntime } from "src/enums/extension-runtime"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { sessionStore } from "src/services/session-store"
import { type CatalogExtension } from "src/types/CatalogExtension"
import { openComponentInWorkbench } from "src/utils/component/open-component-in-workbench"
import { getExtensionProvidesLabels } from "src/utils/extension/get-extension-provides-labels"
import { getRuntimeSummary } from "src/utils/extension/get-runtime-summary"
import { formatFileSize } from "src/utils/file/format-file-size"

import { CatalogInstallButton } from "./CatalogInstallButton.tsx"
import { ExtensionComponentsSection, type ExtensionComponentsSectionItem } from "./ExtensionComponentsSection.tsx"
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
  const isUpdate = status === "update-available"
  // GitLab doesn't give sizes, a partial total would be wrong
  const hasSizes = entry.files.every((file) => file.size !== undefined)
  const totalBytes = entry.files.reduce((total, file) => total + (file.size ?? 0), 0)
  const { tools } = entry

  // Every program the extension starts, each named once
  const commands = [...new Set(tools
    .filter((tool) => tool.runtime === ExtensionRuntime.Executable)
    .map((tool) => tool.command ?? "a program"))]
  const isExecutable = commands.length > 0

  // Opening needs the installed copy, which may list other tools after an update
  const canOpen = status === "installed" || isUpdate
  const getInstalledTool = (toolId: string) => installed?.tools.find((tool) => tool.definition.toolId === toolId)

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
  // The installed copy's component, when there is one to open
  const componentItems: ExtensionComponentsSectionItem[] = entry.components.map((component) => {
    const installedComponent = canOpen
      ? installed?.components.find((item) => item.definition.componentId === component.componentId)
      : undefined

    return {
      ...component,
      onOpen: installedComponent && (() => { openComponentInWorkbench(installedComponent.key) })
    }
  })

  const runtimeLabel = getRuntimeSummary(tools.map((tool) => tool.runtime))

  return (
    <ExtensionDetails
      name={entry.name}
      version={entry.version}
      author={entry.author}
      provides={getExtensionProvidesLabels(tools.length, entry.components.length)}
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
          <CatalogInstallButton entry={entry} />
        </>
      )}
      fields={[
        { label: "Extension ID", value: <code>{extensionCatalogService.getEntryExtensionId(entry)}</code> },
        { label: "Version", value: entry.version },
        !!installed?.manifest?.version && { label: "Installed", value: `v${installed.manifest.version}` },
        { label: "Runtime", value: runtimeLabel },
        { label: "Category", value: entry.category },
        { label: "Source", value: extensionCatalogService.getSourceLabel(entry.sourceId) },
        hasSizes && { label: "Size", value: formatFileSize(totalBytes ?? 0) }
      ]}
      tabs={[
        {
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
          count: entry.files.length,
          isFill: true,
          content: (
            <ExtensionFilesExplorer
              files={entry.files}
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
