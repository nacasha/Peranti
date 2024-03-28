import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { SecondarySidebarSection } from "src/components/sidebar/SecondarySidebar"
import { SecondarySidebarSections } from "src/constants/secondary-sidebar-sections"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

export const AppletSampleSelector: FC = () => {
  const hasSample = useSelector(() => activeAppletStore.getActiveApplet().getHasSamples())
  const isDeleted = useSelector(() => activeAppletStore.getActiveApplet().isDeleted)
  const samples = useSelector(() => activeAppletStore.getActiveApplet().samples)

  const handleClickSample = (sample: typeof samples[0]) => {
    activeAppletStore.getActiveApplet().fillInputValuesWithSample(sample)
  }

  return (
    <SecondarySidebarSection
      sectionKey={SecondarySidebarSections.Samples}
      title="Samples"
      hidden={!hasSample || isDeleted} padding
    >
      {samples.map((sample, index) => (
        <Button
          key={sample.name.concat(index.toString())}
          onClick={() => { handleClickSample(sample) }}
        >
          {sample.name}
        </Button>
      ))}
    </SecondarySidebarSection>
  )
}
