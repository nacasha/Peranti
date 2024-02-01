import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"

import { ToolBatchModeButton } from "../ToolBatchModeButton"
import { ToolDeleteButton } from "../ToolDeleteButton"
import { ToolLoadFromHistoryButton } from "../ToolLoadFromHistoryButton"

import "./ToolHeader.scss"

export const ToolHeader = () => {
  return (
    <div className="ToolHeader">
      <div className="ToolHeader-button-list">
        <ToolLoadFromHistoryButton/>
        <ToolBatchModeButton />
        <ToolDeleteButton />
      </div>

      <div className="ToolHeader-button-list">
        <Button icon={Icons.Settings}>
          Tool Settings
        </Button>
      </div>
    </div>
  )
}
