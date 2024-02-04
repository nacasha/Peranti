import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

export const ToolSampleButton: FC = () => {
  const toolHasSample = useSelector(() => toolRunnerStore.getActiveTool().getHasSamples())
  const isDeleted = useSelector(() => toolRunnerStore.getActiveTool().isDeleted)

  if (!toolHasSample || isDeleted) {
    return null
  }

  const handleClick = () => {
    toolRunnerStore.fillInputValuesWithSample()
  }

  return (
    <Button icon={Icons.Documents} onClick={handleClick}>
      Sample
    </Button>
  )
}
