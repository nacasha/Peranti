import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { SecondarySidebarSection } from "src/components/sidebar/SecondarySidebar"
import { AppletType } from "src/enums/applet-type"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

export const PipelineOptions: FC = () => {
  const type = useSelector(() => activeAppletStore.getActiveApplet().type)
  const viewMode = useSelector(() => activeAppletStore.getActiveApplet().viewMode)

  const handleClickRun = () => {
    void activeAppletStore.getActiveApplet().run()
  }

  const handleClickView = () => {
    activeAppletStore.getActiveApplet().setViewMode("main")
  }

  const handleClickEditPipeline = () => {
    activeAppletStore.getActiveApplet().setViewMode("pipeline")
  }

  if (type !== AppletType.Pipeline) {
    return null
  }

  return (
    <SecondarySidebarSection title="Pipeline" padding>
      {viewMode === "main"
        ? (
          <>
            <Button onClick={handleClickRun}>Run Pipeline</Button>
            <Button onClick={handleClickEditPipeline}>Edit Pipeline</Button>
          </>
        )
        : (
          <Button onClick={handleClickView}>View As Tool</Button>
        )}
    </SecondarySidebarSection>
  )
}
