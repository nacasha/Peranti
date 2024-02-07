import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { activeAppletStore } from "src/services/active-applet-store"

export const ToggleBatchModeButton: FC = observer(() => {
  const activeTool = activeAppletStore.getActiveApplet()

  const onClickButton = () => {
    activeAppletStore.toggleBatchMode()
  }

  if (!activeAppletStore.hasBatchOutput || activeTool.isDeleted) {
    return null
  }

  return (
    <Button icon={Icons.Layers2} onClick={onClickButton}>
      Batch
    </Button>
  )
})
