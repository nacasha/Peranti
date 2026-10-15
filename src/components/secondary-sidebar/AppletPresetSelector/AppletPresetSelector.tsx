import NiceModal from "@ebay/nice-modal-react"
import clsx from "clsx"
import { toJS } from "mobx"
import { type FC } from "react"

import { ButtonIcon } from "src/components/common/ButtonIcon"
import { AddSnippetDialog } from "src/components/dialog/AddSnippetDialog"
import { SecondarySidebarSection } from "src/components/sidebar/SecondarySidebar"
import { Icons } from "src/constants/icons"
import { SecondarySidebarSections } from "src/constants/secondary-sidebar-sections"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { sessionStore } from "src/services/session-store"
import { snippetsStore } from "src/services/snippets-store"
import { type AppletPreset } from "src/types/AppletPreset"

export const AppletPresetSelector: FC = () => {
  const appletId = useSelector(() => activeAppletStore.getActiveApplet().appletId)
  const isDeleted = useSelector(() => activeAppletStore.getActiveApplet().isDeleted)
  const presets = useSelector(() => activeAppletStore.getActiveApplet().presets)
  const snippets = useSelector(() => snippetsStore.getByAppletId(activeAppletStore.getActiveApplet().appletId))

  const hasApplet = appletId !== ""

  const handleClickPreset = (preset: typeof presets[0]) => {
    activeAppletStore.getActiveApplet().fillInputValuesWithPreset(preset)
  }

  const handleOpenInNewTab = (preset: typeof presets[0]) => {
    sessionStore.createSessionOfActiveApplet()?.fillInputValuesWithPreset(preset)
  }

  const handleSave = (name: string, includeOptions: boolean) => {
    const applet = activeAppletStore.getActiveApplet()
    snippetsStore.add(appletId, name, applet.inputValues, includeOptions ? toJS(applet.optionValues) : undefined)
  }

  return (
    <SecondarySidebarSection
      sectionKey={SecondarySidebarSections.Presets}
      title="Presets"
      icon={Icons.Thunder}
      hidden={!hasApplet}
      actions={!isDeleted && (
        <ButtonIcon
          icon={Icons.Plus}
          iconSize={13}
          tooltip="Add snippet"
          onClick={() => { void NiceModal.show(AddSnippetDialog, { onSave: handleSave }) }}
        />
      )}
    >
      {presets.length === 0 && snippets.length === 0 && (
        <div className="AppletPresetSelector-empty">No presets</div>
      )}
      {presets.map((preset, index) => (
        <PresetRow
          key={preset.name.concat(index.toString())}
          preset={preset}
          disabled={isDeleted}
          onClick={() => { handleClickPreset(preset) }}
          onOpenInNewTab={() => { handleOpenInNewTab(preset) }}
        />
      ))}
      {snippets.map((snippet) => (
        <PresetRow
          key={snippet.id}
          preset={snippet}
          disabled={isDeleted}
          onClick={() => { handleClickPreset(snippet) }}
          onOpenInNewTab={() => { handleOpenInNewTab(snippet) }}
          onRemove={() => { snippetsStore.remove(snippet.id) }}
        />
      ))}
    </SecondarySidebarSection>
  )
}

interface PresetRowProps {
  preset: AppletPreset
  disabled: boolean
  onClick: () => void
  onOpenInNewTab: () => void
  onRemove?: () => void
}

const PresetRow: FC<PresetRowProps> = ({ preset, disabled, onClick, onOpenInNewTab, onRemove }) => (
  <div
    className={clsx("AppletPresetSelector-row", { disabled })}
    role="button"
    tabIndex={disabled ? -1 : 0}
    onClick={onClick}
  >
    <span className="AppletPresetSelector-name">{preset.name}</span>
    <span
      className="AppletPresetSelector-actions"
      onClick={(event) => { event.stopPropagation() }}
    >
      <ButtonIcon icon={Icons.OpenInNewTab} iconSize={12} tooltip="Open in new tab" onClick={onOpenInNewTab} />
      {onRemove && (
        <ButtonIcon icon={Icons.Trash} iconSize={12} tooltip="Remove snippet" onClick={onRemove} />
      )}
    </span>
  </div>
)
