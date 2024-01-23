import { observer } from "mobx-react"

import { Button } from "src/components/common/Button"
import { icons } from "src/constants/icons"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

import { ToolBatchModeButton } from "../ToolBatchModeButton"
import { ToolLoadFromHistoryButton } from "../ToolLoadFromHistoryButton"

import "./ToolHeader.scss"

export const ToolHeader = observer(() => {
  const activeTool = toolRunnerStore.getActiveTool()

  const isToolReadOnly = activeTool.isReadOnly

  const onClickHistory = () => {
    toolRunnerStore.toggleHistoryPanel()
  }

  const onClickClean = () => {
    toolRunnerStore.cleanActiveToolState()
  }

  return (
    <div className="ToolHeader">
      <div className="ToolHeader-button-list">
        {!isToolReadOnly && (
          <Button icon={icons.Clean} onClick={onClickClean}>
            Clear
          </Button>
        )}
        <ToolLoadFromHistoryButton/>
        <ToolBatchModeButton />
      </div>

      <div className="ToolHeader-button-list">
        <Button icon={icons.Settings}>
          Tool Settings
        </Button>
        <Button icon={icons.History} onClick={onClickHistory}>
          History
        </Button>
      </div>
    </div>
  )
})
