import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { activeSessionStore } from "src/stores/activeSessionStore"

export const ToolSampleButton: FC = () => {
  const toolHasSample = useSelector(() => activeSessionStore.getActiveTool().getHasSamples())
  const isDeleted = useSelector(() => activeSessionStore.getActiveTool().isDeleted)

  if (!toolHasSample || isDeleted) {
    return null
  }

  const handleClick = () => {
    activeSessionStore.fillInputValuesWithSample()
  }

  return (
    <Button icon={Icons.Documents} onClick={handleClick}>
      Sample
    </Button>
  )
}
