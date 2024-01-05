import { assets } from "src/constants/assets"
import { toolStore } from "src/stores/toolStore"

import { ToolBatchModeButton } from "../ToolBatchModeButton"
import { ToolLoadFromHistoryButton } from "../ToolLoadFromHistoryButton"
import { ToolRunButton } from "../ToolRunButton"

import "./ToolHeader.scss"

import { Button } from "src/components/common/Button"

export const ToolHeader = () => {
  const onClickHistory = () => {
    toolStore.toggleHistoryPanel()
  }

  return (
    <div className="ToolHeader">
      <div className="ToolHeader-button-list">
        <ToolLoadFromHistoryButton/>
        <ToolRunButton/>
        <ToolBatchModeButton />
      </div>

      <div className="ToolHeader-button-list">
        <Button icon={assets.SettingsSVG}>
          Tool Settings
        </Button>
        <Button icon={assets.HistorySVG} onClick={onClickHistory}>
          History
        </Button>
      </div>
    </div>
  )
}
