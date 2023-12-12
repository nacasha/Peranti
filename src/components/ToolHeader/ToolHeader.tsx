import { ToolRunButton } from "src/components/ToolRunButton"

import "./ToolHeader.scss"
import { assets } from "src/constants/assets"
import { ToolLoadFromHistoryButton } from "../ToolLoadFromHistoryButton"
import { toolStore } from "src/stores/toolStore"

export const ToolHeader = () => {
  const onClickHistory = () => {
    toolStore.toggleHistoryPanel()
  }

  return (
    <div className="ToolHeader">
      <div>
        <ToolLoadFromHistoryButton />
        <ToolRunButton />
      </div>

      <div className="ToolHeader-button-list">
        <div className="toolbar-button">
          <img src={assets.SettingsSVG} alt="History" />
          Tool Settings
        </div>
        <div className="toolbar-button" onClick={onClickHistory}>
          <img src={assets.HistorySVG} alt="History" />
          History
        </div>
      </div>
    </div>
  )
}
