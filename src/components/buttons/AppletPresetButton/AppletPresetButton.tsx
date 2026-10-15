import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

export const AppletPresetButton: FC = () => {
  const hasPreset = useSelector(() => activeAppletStore.getActiveApplet().getHasPresets())
  const isDeleted = useSelector(() => activeAppletStore.getActiveApplet().isDeleted)

  if (!hasPreset || isDeleted) {
    return null
  }

  const handleClick = () => {
    // activeAppletStore.fillInputValuesWithPreset()
  }

  return (
    <Button icon={Icons.Documents} onClick={handleClick}>
      Presets
    </Button>
  )
}
