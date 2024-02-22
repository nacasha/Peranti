import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { SecondarySidebarSection } from "src/components/sidebar/SecondarySidebar"
import { AppletType } from "src/enums/applet-type"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

export const PipelineOptions: FC = () => {
  const type = useSelector(() => activeAppletStore.getActiveApplet().type)

  const handleClickOpenTool = () => {
    activeAppletStore.getActiveApplet().setViewMode("main")
  }
  const handleClickEditPipeline = () => {
    activeAppletStore.getActiveApplet().setViewMode("pipeline")
  }

  if (type !== AppletType.Pipeline) {
    return null
  }

  return (
    <SecondarySidebarSection title="Pipeline">
      <Button onClick={handleClickOpenTool}>Open Tool</Button>
      <Button onClick={handleClickEditPipeline}>Edit Pipeline</Button>
    </SecondarySidebarSection>
  )
}
