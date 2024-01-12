import { observer } from "mobx-react"
import { type FC } from "react"

import { Button } from "src/components/common/Button"
import { assets } from "src/constants/assets"
import { toolStore } from "src/stores/toolStore"

export const ToolLoadFromHistoryButton: FC = observer(() => {
  const activeTool = toolStore.getActiveTool()

  const onClick = () => {
    toolStore.makeCurrentToolHistoryEditable()
  }

  if (!activeTool.isReadOnly) {
    return null
  }

  return (
    <Button icon={assets.DownloadSVG} onClick={onClick}>
      Edit This History
    </Button>
  )
})
