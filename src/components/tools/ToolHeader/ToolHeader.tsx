import { ToolBatchModeButton } from "src/components/buttons/ToolBatchModeButton"
import { ToolDeleteButton } from "src/components/buttons/ToolDeleteButton"
import { ToolLoadFromHistoryButton } from "src/components/buttons/ToolLoadFromHistoryButton"
import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"

import "./ToolHeader.scss"

export const ToolHeader = () => {
  return (
    <div className="ToolHeader">
      <div className="ToolHeader-button-list">
        <ToolLoadFromHistoryButton />
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
