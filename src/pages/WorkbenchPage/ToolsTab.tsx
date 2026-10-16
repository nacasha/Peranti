import { clsx } from "clsx"
import { observer } from "mobx-react"
import { useState, type FC } from "react"
import SimpleBar from "simplebar-react"

import { Button } from "src/components/common/Button"
import { ExtensionRuntimeLabels } from "src/constants/extension-runtime-labels"
import { Icons } from "src/constants/icons"
import { AppletType } from "src/enums/applet-type"
import { type AppletConstructor } from "src/models/AppletConstructor"
import { ExtensionDetails, ExtensionFieldsList } from "src/pages/ExtensionsPage/ExtensionDetails.tsx"
import { ExtensionListItem } from "src/pages/ExtensionsPage/ExtensionListItem.tsx"
import { appletStore } from "src/services/applet-store"
import { extensionsService } from "src/services/extensions-service"
import { sessionStore } from "src/services/session-store"
import { type InstalledExtension, type InstalledExtensionTool } from "src/types/InstalledExtension"
import { resolveAppletFields } from "src/utils/applet/resolve-applet-fields"
import { getExtensionToolRuns } from "src/utils/extension/extension-summary"
import { matchesSearchKeyword } from "src/utils/search/matches-search-keyword"

type SourceFilter = "all" | "extension" | "builtin"

const SOURCE_FILTERS: Array<{ value: SourceFilter, label: string }> = [
  { value: "all", label: "All" },
  { value: "extension", label: "Extensions" },
  { value: "builtin", label: "Built-in" }
]

type ToolTarget =
  | { type: "extension", key: string, applet: AppletConstructor, extension: InstalledExtension, tool: InstalledExtensionTool }
  | { type: "builtin", key: string, applet: AppletConstructor }

/**
 * Every tool, those of the loaded extensions first, then the app's own, with
 * how the picked one runs and its inputs and outputs
 */
export const ToolsTab: FC = observer(() => {
  const [keyword, setKeyword] = useState("")
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all")
  const [selectedKey, setSelectedKey] = useState<string>()

  const extensionTargets: ToolTarget[] = extensionsService.loadedExtensions.flatMap((extension) => (
    extension.tools.map((tool) => ({
      type: "extension" as const,
      key: tool.appletConstructor.appletId,
      applet: tool.appletConstructor,
      extension,
      tool
    }))
  ))

  const builtInTargets: ToolTarget[] = appletStore.listOfLoadedApplets
    .filter((applet) => applet.type === AppletType.Tool)
    .map((applet) => ({ type: "builtin" as const, key: applet.appletId, applet }))

  const matches = (target: ToolTarget) => (sourceFilter === "all" || sourceFilter === target.type) && matchesSearchKeyword(keyword, [
    target.applet.name,
    target.applet.appletId,
    target.applet.category,
    target.applet.description,
    target.type === "extension" ? target.extension.manifest?.name : undefined
  ])

  const groups = [
    { title: "Extensions", targets: extensionTargets.filter(matches) },
    { title: "Built-in", targets: builtInTargets.filter(matches) }
  ]
  const visibleTargets = groups.flatMap((group) => group.targets)

  // Kept by key, so it survives a reload of the extensions
  const selected = visibleTargets.find((target) => target.key === selectedKey) ??
    visibleTargets[0] as ToolTarget | undefined

  const renderItem = (target: ToolTarget) => (
    <ExtensionListItem
      key={target.key}
      name={target.applet.name}
      description={target.applet.description}
      meta={target.type === "extension"
        ? `${target.extension.manifest?.name ?? target.extension.folderName} · ${target.applet.category}`
        : target.applet.category}
      isSelected={target.key === selected?.key}
      onSelect={() => { setSelectedKey(target.key) }}
    />
  )

  const renderDetails = (target: ToolTarget) => {
    const { applet } = target
    const definition = target.type === "extension" ? target.tool.definition : undefined
    const extensionComponents = target.type === "extension"
      ? target.extension.components.map(({ definition: component }) => component)
      : undefined

    return (
      <ExtensionDetails
        key={target.key}
        name={applet.name}
        version={target.type === "extension" ? target.extension.manifest?.version : undefined}
        author={target.type === "extension" ? target.extension.manifest?.author : undefined}
        chips={[
          target.type === "builtin" ? "Built-in" : definition?.runtime && ExtensionRuntimeLabels[definition.runtime],
          applet.category,
          applet.autoRun && "Runs on change"
        ]}
        description={applet.description}
        actions={(
          <Button
            icon={Icons.OpenInNewTab}
            variant="primary"
            onClick={() => { sessionStore.findOrCreateSession(applet) }}
          >
            Open Tool
          </Button>
        )}
        fields={[
          { label: "Tool ID", value: <code>{applet.appletId}</code> },
          target.type === "extension" && {
            label: "Extension",
            value: target.extension.manifest?.name ?? target.extension.folderName
          },
          definition && { label: "Runs", value: <code>{getExtensionToolRuns(definition)}</code> },
          target.type === "extension" && { label: "Defined in", value: <code>{target.tool.path}</code> }
        ]}
      >
        <ExtensionFieldsList
          inputFields={resolveAppletFields(applet.inputFields)}
          outputFields={resolveAppletFields(applet.outputFields)}
          extensionComponents={extensionComponents}
        />
      </ExtensionDetails>
    )
  }

  return (
    <div className="ExtensionsPage-split">
      <div className="ExtensionsPage-listPane">
        <div className="ExtensionsPage-toolbar">
          <div className="ExtensionsPage-search">
            <Icons.Search size={13} aria-hidden />
            <input
              placeholder="Search tools"
              value={keyword}
              onChange={(event) => { setKeyword(event.target.value) }}
              autoComplete="off"
            />
          </div>

          <div className="ExtensionsPage-segmented" role="radiogroup" aria-label="Source">
            {SOURCE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                role="radio"
                aria-checked={sourceFilter === filter.value}
                className={clsx(sourceFilter === filter.value && "active")}
                onClick={() => { setSourceFilter(filter.value) }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="ExtensionsPage-scrollArea">
          <SimpleBar className="ExtensionsPage-scroll">
            <div className="ExtensionsPage-list" role="list">
              {visibleTargets.length === 0 && (
                <div className="ExtensionsPage-listEmpty">
                  {keyword.trim() ? `Nothing matches "${keyword.trim()}"` : "No tools here"}
                </div>
              )}
              {groups.map((group) => group.targets.length > 0 && (
                <div key={group.title} className="ExtensionsPage-listGroup">
                  <div className="ExtensionsPage-listGroup-title">
                    {group.title}
                    <span>{group.targets.length}</span>
                  </div>
                  {group.targets.map(renderItem)}
                </div>
              ))}
              {!keyword.trim() && sourceFilter !== "builtin" && extensionTargets.length === 0 && (
                <div className="ExtensionsPage-listHint">
                  No extension tools loaded yet. Install one from Extensions.
                </div>
              )}
            </div>
          </SimpleBar>
        </div>
      </div>

      <div className="ExtensionsPage-detailsPane">
        {selected && renderDetails(selected)}
      </div>
    </div>
  )
})
