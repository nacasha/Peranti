import { open } from "@tauri-apps/plugin-dialog"
import { observer } from "mobx-react"
import { useState, type FC } from "react"
import toast from "react-hot-toast"

import { Button } from "src/components/common/Button"
import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Checkbox } from "src/components/common/Checkbox"
import { Input } from "src/components/common/Input"
import { SettingsCard, SettingsCardItem } from "src/components/settings/SettingsCard"
import { CatalogSourceTypeLabels } from "src/constants/catalog-source-type-labels"
import { ExtensionCatalog } from "src/constants/extension-catalog"
import { Icons } from "src/constants/icons"
import { CatalogSourceType } from "src/enums/catalog-source-type"
import { useNow } from "src/hooks/useNow"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { extensionsService } from "src/services/extensions-service"
import { detectCatalogSourceType } from "src/utils/catalog/detect-catalog-source-type"
import { formatCatalogUpdatedLabel } from "src/utils/catalog/format-catalog-updated-label"
import { getCatalogSourceLabel } from "src/utils/catalog/get-catalog-source-label"
import { refreshAllSourcesWithToast, refreshSourceWithToast, reloadExtensionsWithToast } from "src/utils/catalog/refresh-with-toast"
import { getErrorMessage } from "src/utils/common/get-error-message"
import { isRunningInTauri } from "src/utils/common/is-running-in-tauri"
import { prettyDateFormat } from "src/utils/time/pretty-date-format"

import "./SettingsExtensions.scss"

type SourceMode = "remote" | "local"

/**
 * Repo hosts picked by hand when the URL doesn't tell
 */
const repoTypes = [CatalogSourceType.GitHub, CatalogSourceType.GitLab, CatalogSourceType.Gitea]

/**
 * Extensions settings: the extensions folder, and the sources Discover lists
 * or, for local folders, links under Installed
 */
export const SettingsExtensions: FC = observer(() => {
  const { sources, sourceStates, isLoading } = extensionCatalogService
  const now = useNow()

  const [mode, setMode] = useState<SourceMode>("remote")
  const [location, setLocation] = useState("")
  const [branch, setBranch] = useState("")
  const [pickedType, setPickedType] = useState<CatalogSourceType>()
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string>()

  const isLocal = mode === "local"
  const detectedType = detectCatalogSourceType(location)
  const remoteType = pickedType ?? (detectedType === CatalogSourceType.Local ? undefined : detectedType)
  const type = isLocal ? CatalogSourceType.Local : remoteType

  const handleChangeMode = (value: SourceMode) => {
    setMode(value)
    setLocation("")
    setPickedType(undefined)
    setError(undefined)
  }

  const handleChangeLocation = (value: string) => {
    setLocation(value)
    setPickedType(undefined)
    setError(undefined)
  }

  const handleChooseFolder = async() => {
    const folderPath = await open({ directory: true, recursive: true })
    if (typeof folderPath === "string") {
      setLocation(folderPath)
      setError(undefined)
    }
  }

  const handleAdd = async() => {
    if (!location.trim()) {
      setError(isLocal ? "Choose a folder" : "Enter a repo URL")
      return
    }

    if (!type) {
      setError("Can't tell the host from this URL, pick its type")
      return
    }

    setIsAdding(true)
    setError(undefined)

    try {
      const count = await extensionCatalogService.addSource({
        type,
        location,
        branch: isLocal ? undefined : branch
      })

      toast.success(isLocal
        ? `Linked ${count} extension${count === 1 ? "" : "s"}, see Installed`
        : `Added source with ${count} extension${count === 1 ? "" : "s"}`)
      setLocation("")
      setBranch("")
      setPickedType(undefined)
    } catch (exception) {
      setError(getErrorMessage(exception))
    } finally {
      setIsAdding(false)
    }
  }

  const handleOpenFolder = () => {
    void extensionsService.openExtensionsFolder()
  }

  return (
    <div className="SettingsExtensions">
      <SettingsCard title="Extensions">
        {isRunningInTauri && (
          <SettingsCardItem
            label="Extensions Folder"
            description="Installed extensions are copied here, one folder each"
          >
            <Button icon={Icons.Folder} onClick={handleOpenFolder}>Open Folder</Button>
          </SettingsCardItem>
        )}

        <SettingsCardItem
          label="Reload Extensions"
          description="Read every extension again, after editing one by hand"
        >
          <Button icon={Icons.Refresh} onClick={() => { void reloadExtensionsWithToast() }}>Reload</Button>
        </SettingsCardItem>
      </SettingsCard>

      <SettingsCard title="Sources">
        <div className="SettingsExtensions-list">
          {sources.map((source) => {
            const state = sourceStates[source.id]
            const isDefault = source.id === ExtensionCatalog.defaultSource.id
            const isEnabled = extensionCatalogService.isSourceEnabled(source.id)
            // A local source's extensions are loaded in place, not listed
            const linkedCount = source.type === CatalogSourceType.Local
              ? extensionsService.installedExtensions.filter((extension) => extension.linkedSourceId === source.id).length
              : undefined

            return (
              <div key={source.id} className="SettingsExtensions-source">
                <Checkbox
                  value={isEnabled}
                  onChange={(enabled) => { extensionCatalogService.setSourceEnabled(source.id, enabled) }}
                />

                <div className="SettingsExtensions-source-main">
                  <div className="SettingsExtensions-source-title">
                    <span>{getCatalogSourceLabel(source)}</span>
                    <span className="SettingsExtensions-badge">{CatalogSourceTypeLabels[source.type]}</span>
                    {isDefault && <span className="SettingsExtensions-badge">Default</span>}
                    {source.branch && source.branch !== "main" && (
                      <span className="SettingsExtensions-badge">{source.branch}</span>
                    )}
                  </div>
                  <div className="SettingsExtensions-source-location">{source.location}</div>
                  {isEnabled && state?.error && (
                    <div className="SettingsExtensions-error">{state.error}</div>
                  )}
                </div>

                <div className="SettingsExtensions-source-status">
                  <span>
                    {!isEnabled
                      ? "Off"
                      : linkedCount !== undefined
                        ? `${linkedCount} extension${linkedCount === 1 ? "" : "s"}`
                        : state?.isLoaded
                          ? `${state.extensions.length} extension${state.extensions.length === 1 ? "" : "s"}`
                          : state?.isLoading
                            ? "Loading…"
                            : ""}
                  </span>
                  {isEnabled && linkedCount !== undefined && (
                    <span className="SettingsExtensions-source-updated">Always in sync</span>
                  )}
                  {isEnabled && state?.updatedAt !== undefined && (
                    <span
                      className="SettingsExtensions-source-updated"
                      title={`Read ${prettyDateFormat(new Date(state.updatedAt))}`}
                    >
                      {formatCatalogUpdatedLabel(state.updatedAt, state.isLoading, now)}
                    </span>
                  )}
                </div>

                {isEnabled && (
                  // A source already loading ignores the click
                  <ButtonIcon
                    icon={Icons.Refresh}
                    tooltip={linkedCount !== undefined ? "Reload Extensions" : "Refresh Source"}
                    onClick={() => { void refreshSourceWithToast(source) }}
                  />
                )}

                <ButtonIcon
                  icon={Icons.Trash}
                  tooltip={isDefault ? "The default source can't be removed, turn it off instead" : "Remove Source"}
                  disabled={isDefault}
                  onClick={() => { extensionCatalogService.removeSource(source.id) }}
                />
              </div>
            )
          })}

          <div className="SettingsExtensions-listFooter">
            <Button
              icon={Icons.Refresh}
              disabled={isLoading}
              onClick={() => { void refreshAllSourcesWithToast() }}
            >
              {isLoading ? "Refreshing…" : "Refresh All"}
            </Button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Add a Source">
        <div className="SettingsExtensions-add">
          {isRunningInTauri && (
            <div className="SettingsExtensions-types">
              <Button active={!isLocal} onClick={() => { handleChangeMode("remote") }}>Remote</Button>
              <Button active={isLocal} onClick={() => { handleChangeMode("local") }}>Local</Button>
            </div>
          )}

          <div className="SettingsExtensions-row">
            <Input
              className="Input SettingsExtensions-location"
              placeholder={isLocal ? "Folder path" : "Repo URL"}
              value={location}
              onChange={(event) => { handleChangeLocation(event.target.value) }}
              onKeyDown={(event) => { if (event.key === "Enter") void handleAdd() }}
            />
            {isLocal && (
              <Button icon={Icons.Folder} onClick={() => { void handleChooseFolder() }}>
                Choose Folder
              </Button>
            )}
          </div>

          {!isLocal && (
            <div className="SettingsExtensions-row">
              <div className="SettingsExtensions-types">
                {repoTypes.map((repoType) => (
                  <Button
                    key={repoType}
                    active={type === repoType}
                    onClick={() => { setPickedType(repoType) }}
                  >
                    {CatalogSourceTypeLabels[repoType]}
                  </Button>
                ))}
              </div>

              {type && (
                <Input
                  className="Input SettingsExtensions-branch"
                  placeholder="main"
                  value={branch}
                  onChange={(event) => { setBranch(event.target.value) }}
                  onKeyDown={(event) => { if (event.key === "Enter") void handleAdd() }}
                />
              )}
            </div>
          )}

          {error && <div className="SettingsExtensions-error">{error}</div>}

          <div className="SettingsExtensions-addFooter">
            <Button
              variant="primary"
              icon={Icons.Plus}
              disabled={isAdding || !location.trim()}
              onClick={() => { void handleAdd() }}
            >
              {isAdding ? "Checking…" : "Add Source"}
            </Button>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
})
