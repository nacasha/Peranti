import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

export const AppletSampleButton: FC = () => {
  const hasSample = useSelector(() => activeAppletStore.getActiveApplet().getHasSamples())
  const isDeleted = useSelector(() => activeAppletStore.getActiveApplet().isDeleted)

  if (!hasSample || isDeleted) {
    return null
  }

  const handleClick = () => {
    activeAppletStore.fillInputValuesWithSample()
  }

  return (
    <Button icon={Icons.Documents} onClick={handleClick}>
      Sample
    </Button>
  )
}
