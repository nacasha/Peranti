import { clsx } from "clsx"
import { observer } from "mobx-react"
import { useEffect, useMemo, useState, type FC } from "react"
import SimpleBar from "simplebar-react"

import { ComponentValueTypeLabels } from "src/constants/component-value-types"
import { Icons } from "src/constants/icons"
import { ExtensionListItem, type ExtensionListItemBadge } from "src/pages/ExtensionsPage/ExtensionListItem.tsx"
import { extensionsService } from "src/services/extensions-service"
import { workbenchPageStore } from "src/services/workbench-page-store"
import { type ComponentPlaygroundTarget } from "src/types/ComponentPlaygroundTarget"
import { getBuiltInComponentEntries } from "src/utils/component/get-built-in-component-entries"
import { matchesSearchKeyword } from "src/utils/search/matches-search-keyword"

import { ComponentPlayground } from "./ComponentPlayground.tsx"

type KindFilter = "all" | "input" | "output"

const KIND_FILTERS: Array<{ value: KindFilter, label: string }> = [
  { value: "all", label: "All" },
  { value: "input", label: "Input" },
  { value: "output", label: "Output" }
]

/**
 * Every field component, those of the loaded extensions first, then the
 * app's own, with a playground for the picked one
 */
export const ComponentsTab: FC = observer(() => {
  const [keyword, setKeyword] = useState("")
  const [kindFilter, setKindFilter] = useState<KindFilter>("all")
  const [selectedKey, setSelectedKey] = useState<string | undefined>(
    () => workbenchPageStore.consumePendingComponentKey()
  )
  const { pendingComponentKey } = workbenchPageStore

  // Opened for a component while this tab is already showing
  useEffect(() => {
    const key = workbenchPageStore.consumePendingComponentKey()
    if (key) {
      setSelectedKey(key)
      setKeyword("")
      setKindFilter("all")
    }
  }, [pendingComponentKey])

  // The built-in list never changes while the app runs
  const builtInTargets = useMemo((): ComponentPlaygroundTarget[] => getBuiltInComponentEntries().map((entry) => ({
    type: "builtin",
    key: `builtin:${entry.name}`,
    entry
  })), [])

  const extensionTargets: ComponentPlaygroundTarget[] = extensionsService.loadedExtensions.flatMap((extension) => (
    extension.components.map((component) => ({ type: "extension" as const, key: component.key, extension, component }))
  ))

  // A component usable both ways shows under Input and under Output
  const matchesKind = (target: ComponentPlaygroundTarget) => {
    if (kindFilter === "all") {
      return true
    }
    const kind = target.type === "extension" ? (target.component.definition.kind ?? "both") : target.entry.kind
    return kind === "both" || kind === kindFilter
  }

  const matches = (target: ComponentPlaygroundTarget) => matchesKind(target) && (target.type === "extension"
    ? matchesSearchKeyword(keyword, [
      target.component.definition.name,
      target.component.definition.componentId,
      target.component.definition.description,
      target.extension.manifest?.name
    ])
    : matchesSearchKeyword(keyword, [target.entry.name]))

  const groups = [
    { title: "Extensions", targets: extensionTargets.filter(matches) },
    { title: "Built-in", targets: builtInTargets.filter(matches) }
  ]
  const visibleTargets = groups.flatMap((group) => group.targets)

  // Kept by key, so it survives a reload of the extensions
  const selected = visibleTargets.find((target) => target.key === selectedKey) ??
    visibleTargets[0] as ComponentPlaygroundTarget | undefined

  const renderItem = (target: ComponentPlaygroundTarget) => {
    if (target.type === "extension") {
      const { definition } = target.component

      return (
        <ExtensionListItem
          key={target.key}
          name={definition.name}
          description={definition.description}
          meta={`@${definition.componentId} · ${target.extension.manifest?.name ?? target.extension.folderName}`}
          provides={(["input", "output"] as const)
            .filter((side) => (definition.kind ?? "both") === "both" || definition.kind === side)
            .map((side) => ({
              label: side === "input" ? "Input" : "Output",
              detail: ComponentValueTypeLabels[definition.value?.type ?? "any"],
              tone: side
            }))}
          isSelected={target.key === selected?.key}
          onSelect={() => { setSelectedKey(target.key) }}
        />
      )
    }

    return (
      <ExtensionListItem
        key={target.key}
        name={target.entry.name}
        // A name can be two components, each side with its own type
        provides={(["input", "output"] as const).flatMap((side): ExtensionListItemBadge[] => {
          const appletComponent = target.entry[side]
          if (!appletComponent) {
            return []
          }
          return [{
            label: side === "input" ? "Input" : "Output",
            detail: ComponentValueTypeLabels[appletComponent.value?.type ?? "any"],
            tone: side
          }]
        })}
        isSelected={target.key === selected?.key}
        onSelect={() => { setSelectedKey(target.key) }}
      />
    )
  }

  return (
    <div className="ExtensionsPage-split">
      <div className="ExtensionsPage-listPane">
        <div className="ExtensionsPage-toolbar">
          <div className="ExtensionsPage-search">
            <Icons.Search size={13} aria-hidden />
            <input
              placeholder="Search components"
              value={keyword}
              onChange={(event) => { setKeyword(event.target.value) }}
              autoComplete="off"
            />
          </div>

          <div className="ExtensionsPage-segmented" role="radiogroup" aria-label="Kind">
            {KIND_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                role="radio"
                aria-checked={kindFilter === filter.value}
                className={clsx(kindFilter === filter.value && "active")}
                onClick={() => { setKindFilter(filter.value) }}
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
                  {keyword.trim() ? `Nothing matches "${keyword.trim()}"` : "No components of this kind"}
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
              {!keyword.trim() && extensionTargets.length === 0 && (
                <div className="ExtensionsPage-listHint">
                  No extension provides components yet. Install one, such as Sample: Color Kit, to see it here.
                </div>
              )}
            </div>
          </SimpleBar>
        </div>
      </div>

      <div className="ExtensionsPage-detailsPane">
        {selected && <ComponentPlayground key={selected.key} target={selected} />}
      </div>
    </div>
  )
})
