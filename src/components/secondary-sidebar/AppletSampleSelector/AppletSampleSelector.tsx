import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { SecondarySidebarSection } from "src/components/sidebar/SecondarySidebar"
import { Icons } from "src/constants/icons"
import { SecondarySidebarSections } from "src/constants/secondary-sidebar-sections"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

export const AppletSampleSelector: FC = () => {
  const hasApplet = useSelector(() => activeAppletStore.getActiveApplet().appletId !== "")
  const isDeleted = useSelector(() => activeAppletStore.getActiveApplet().isDeleted)
  const samples = useSelector(() => activeAppletStore.getActiveApplet().samples)

  const handleClickSample = (sample: typeof samples[0]) => {
    activeAppletStore.getActiveApplet().fillInputValuesWithSample(sample)
  }

  return (
    <SecondarySidebarSection
      sectionKey={SecondarySidebarSections.Samples}
      title="Presets"
      icon={Icons.Thunder}
      hidden={!hasApplet}
    >
      {samples.length === 0 && (
        <div className="AppletSampleSelector-empty">No presets</div>
      )}
      {samples.map((sample, index) => (
        <Button
          className="AppletSampleSelector-item"
          key={sample.name.concat(index.toString())}
          disabled={isDeleted}
          onClick={() => { handleClickSample(sample) }}
        >
          {sample.name}
        </Button>
      ))}
    </SecondarySidebarSection>
  )
}
