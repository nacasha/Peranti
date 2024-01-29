import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

export const ToolClearButton: FC = () => {
  const isDeleted = useSelector(() => toolRunnerStore.getActiveTool().isDeleted)

  const onClickClean = () => {
    toolRunnerStore.cleanActiveToolState()
  }

  if (isDeleted) {
    return null
  }

  return (
    <Button icon={Icons.Download} onClick={onClickClean}>
      Reset To Default
    </Button>
  )
}
