import { observer } from "mobx-react"
import { type FC } from "react"
import { assets } from "src/constants/assets"
import { toolStore } from "src/store/toolStore"

export const ToolLoadFromHistoryButton: FC = observer(() => {
  const activeTool = toolStore.getActiveTool()

  const onClick = () => {
    toolStore.openToolFromViewedHistory()
  }

  if (!activeTool.isReadOnly) {
    return null
  }

  return (
    <div className="toolbar-button" onClick={onClick}>
      <img src={assets.DownloadSVG} alt="Run" />
      Load From History
    </div>
  )
})
