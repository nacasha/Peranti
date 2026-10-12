import NiceModal from "@ebay/nice-modal-react"
import { open } from "@tauri-apps/plugin-dialog"
import { observer } from "mobx-react"
import { useState } from "react"
import toast from "react-hot-toast"

import { Button } from "src/components/common/Button"
import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Checkbox } from "src/components/common/Checkbox"
import { Input } from "src/components/common/Input"
import { CatalogSourceTypeLabels } from "src/constants/catalog-source-type-labels"
import { ExtensionCatalog } from "src/constants/extension-catalog"
import { Icons } from "src/constants/icons"
import { CatalogSourceType } from "src/enums/catalog-source-type"
import { extensionCatalogService } from "src/services/extension-catalog-service"
import { detectCatalogSourceType } from "src/utils/detect-catalog-source-type"
import { getCatalogSourceLabel } from "src/utils/get-catalog-source-label"
import { isRunningInTauri } from "src/utils/is-running-in-tauri"

import { Dialog } from "../Dialog"

import "./CatalogSourcesDialog.scss"

/**
 * Types picked by hand, a local folder is chosen with its own button
 */
const remoteTypes = [
  CatalogSourceType.GitHub,
  CatalogSourceType.GitLab,
  CatalogSourceType.Gitea,
  CatalogSourceType.Url
]

const gitTypes = [CatalogSourceType.GitHub, CatalogSourceType.GitLab, CatalogSourceType.Gitea]

/**
 * Add, remove and turn on or off the catalogs the Browse tab lists
 */
export const CatalogSourcesDialog = NiceModal.create(observer(() => {
  const { sources, sourceStates } = extensionCatalogService

  const [location, setLocation] = useState("")
  const [branch, setBranch] = useState("")
  const [pickedType, setPickedType] = useState<CatalogSourceType>()
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string>()

  const detectedType = detectCatalogSourceType(location)
  const type = pickedType ?? detectedType
  const isLocal = type === CatalogSourceType.Local

  const handleChangeLocation = (value: string) => {
    setLocation(value)
    setPickedType(undefined)
    setError(undefined)
  }

  const handleChooseFolder = async() => {
    const folderPath = await open({ directory: true, recursive: true })
    if (typeof folderPath === "string") {
      setLocation(folderPath)
      setPickedType(CatalogSourceType.Local)
      setError(undefined)
    }
  }

  const handleAdd = async() => {
    if (!location.trim()) {
      setError("Enter a repo URL, an index.json URL, or a folder")
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
        branch: gitTypes.includes(type) ? branch : undefined
      })

      toast.success(`Added source with ${count} extension${count === 1 ? "" : "s"}`)
      setLocation("")
      setBranch("")
      setPickedType(undefined)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : String(exception))
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Dialog maxWidth={600}>
      <Dialog.Header>Catalog Sources</Dialog.Header>
      <Dialog.Content>
        <div className="CatalogSourcesDialog">
          <div className="CatalogSourcesDialog-list">
            {sources.map((source) => {
              const state = sourceStates[source.id]
              const isDefault = source.id === ExtensionCatalog.defaultSource.id
              const isEnabled = extensionCatalogService.isSourceEnabled(source.id)

              return (
                <div key={source.id} className="CatalogSourcesDialog-source">
                  <Checkbox
                    value={isEnabled}
                    onChange={(enabled) => { extensionCatalogService.setSourceEnabled(source.id, enabled) }}
                  />

                  <div className="CatalogSourcesDialog-source-main">
                    <div className="CatalogSourcesDialog-source-title">
                      <span>{getCatalogSourceLabel(source)}</span>
                      <span className="CatalogSourcesDialog-badge">{CatalogSourceTypeLabels[source.type]}</span>
                      {isDefault && <span className="CatalogSourcesDialog-badge">Default</span>}
                      {source.branch && source.branch !== "main" && (
                        <span className="CatalogSourcesDialog-badge">{source.branch}</span>
                      )}
                    </div>
                    <div className="CatalogSourcesDialog-source-location">{source.location}</div>
                    {isEnabled && state?.error && (
                      <div className="CatalogSourcesDialog-error">{state.error}</div>
                    )}
                  </div>

                  <div className="CatalogSourcesDialog-source-status">
                    {!isEnabled
                      ? "Off"
                      : state?.isLoading
                        ? "Loading…"
                        : state?.isLoaded && !state.error
                          ? `${state.extensions.length} extension${state.extensions.length === 1 ? "" : "s"}`
                          : ""}
                  </div>

                  {!isDefault && (
                    <ButtonIcon
                      icon={Icons.Trash}
                      tooltip="Remove Source"
                      onClick={() => { extensionCatalogService.removeSource(source.id) }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div className="CatalogSourcesDialog-add">
            <div className="CatalogSourcesDialog-add-title">Add a Source</div>

            <div className="CatalogSourcesDialog-row">
              <Input
                className="Input CatalogSourcesDialog-location"
                placeholder="Repo URL, index.json URL, or folder path"
                value={location}
                onChange={(event) => { handleChangeLocation(event.target.value) }}
                onKeyDown={(event) => { if (event.key === "Enter") void handleAdd() }}
              />
              {isRunningInTauri && (
                <Button icon={Icons.Folder} onClick={() => { void handleChooseFolder() }}>
                  Choose Folder
                </Button>
              )}
            </div>

            {!isLocal && (
              <div className="CatalogSourcesDialog-row">
                <div className="CatalogSourcesDialog-types">
                  {remoteTypes.map((remoteType) => (
                    <Button
                      key={remoteType}
                      active={type === remoteType}
                      onClick={() => { setPickedType(remoteType) }}
                    >
                      {CatalogSourceTypeLabels[remoteType]}
                    </Button>
                  ))}
                </div>

                {type && gitTypes.includes(type) && (
                  <Input
                    className="Input CatalogSourcesDialog-branch"
                    placeholder="main"
                    value={branch}
                    onChange={(event) => { setBranch(event.target.value) }}
                    onKeyDown={(event) => { if (event.key === "Enter") void handleAdd() }}
                  />
                )}
              </div>
            )}

            <div className="CatalogSourcesDialog-hint">
              {isLocal
                ? "Lists every folder with a peranti.json, inside an extensions folder if there is one. No index.json needed."
                : "Repos and URLs need an index.json built with build-index.mjs from the catalog repo."}
            </div>

            {error && <div className="CatalogSourcesDialog-error">{error}</div>}
          </div>
        </div>
      </Dialog.Content>
      <Dialog.Footer>
        <Button
          variant="primary"
          icon={Icons.Plus}
          disabled={isAdding || !location.trim()}
          onClick={() => { void handleAdd() }}
        >
          {isAdding ? "Checking…" : "Add Source"}
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}))
