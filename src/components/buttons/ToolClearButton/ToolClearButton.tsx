import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { activeSessionStore } from "src/stores/activeSessionStore"

export const ToolClearButton: FC = () => {
  const isDeleted = useSelector(() => activeSessionStore.getActiveTool().isDeleted)

  const onClickClean = () => {
    activeSessionStore.cleanActiveSessionState()
  }

  if (isDeleted) {
    return null
  }

  return (
    <Button icon={Icons.Restore} onClick={onClickClean}>
      Reset To Default
    </Button>
  )
}
