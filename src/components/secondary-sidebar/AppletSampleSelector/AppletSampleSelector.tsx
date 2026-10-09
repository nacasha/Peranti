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
import { type AppletSample } from "src/types/AppletSample"

export const AppletSampleSelector: FC = () => {
  const appletId = useSelector(() => activeAppletStore.getActiveApplet().appletId)
  const isDeleted = useSelector(() => activeAppletStore.getActiveApplet().isDeleted)
  const samples = useSelector(() => activeAppletStore.getActiveApplet().samples)
  const snippets = useSelector(() => snippetsStore.getByAppletId(activeAppletStore.getActiveApplet().appletId))

  const hasApplet = appletId !== ""

  const handleClickSample = (sample: typeof samples[0]) => {
    activeAppletStore.getActiveApplet().fillInputValuesWithSample(sample)
  }

  const handleOpenInNewTab = (sample: typeof samples[0]) => {
    sessionStore.createSessionOfActiveApplet()?.fillInputValuesWithSample(sample)
  }

  const handleSave = (name: string, includeOptions: boolean) => {
    const applet = activeAppletStore.getActiveApplet()
    snippetsStore.add(appletId, name, applet.inputValues, includeOptions ? toJS(applet.optionValues) : undefined)
  }

  return (
    <SecondarySidebarSection
      sectionKey={SecondarySidebarSections.Samples}
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
      {samples.length === 0 && snippets.length === 0 && (
        <div className="AppletSampleSelector-empty">No presets</div>
      )}
      {samples.map((sample, index) => (
        <SampleRow
          key={sample.name.concat(index.toString())}
          sample={sample}
          disabled={isDeleted}
          onClick={() => { handleClickSample(sample) }}
          onOpenInNewTab={() => { handleOpenInNewTab(sample) }}
        />
      ))}
      {snippets.map((snippet) => (
        <SampleRow
          key={snippet.id}
          sample={snippet}
          disabled={isDeleted}
          onClick={() => { handleClickSample(snippet) }}
          onOpenInNewTab={() => { handleOpenInNewTab(snippet) }}
          onRemove={() => { snippetsStore.remove(snippet.id) }}
        />
      ))}
    </SecondarySidebarSection>
  )
}

interface SampleRowProps {
  sample: AppletSample
  disabled: boolean
  onClick: () => void
  onOpenInNewTab: () => void
  onRemove?: () => void
}

const SampleRow: FC<SampleRowProps> = ({ sample, disabled, onClick, onOpenInNewTab, onRemove }) => (
  <div
    className={clsx("AppletSampleSelector-row", { disabled })}
    role="button"
    tabIndex={disabled ? -1 : 0}
    onClick={onClick}
  >
    <span className="AppletSampleSelector-name">{sample.name}</span>
    <span
      className="AppletSampleSelector-actions"
      onClick={(event) => { event.stopPropagation() }}
    >
      <ButtonIcon icon={Icons.OpenInNewTab} iconSize={12} tooltip="Open in new tab" onClick={onOpenInNewTab} />
      {onRemove && (
        <ButtonIcon icon={Icons.Trash} iconSize={12} tooltip="Remove snippet" onClick={onRemove} />
      )}
    </span>
  </div>
)
