import { observer } from "mobx-react"
import { type FC } from "react"
import SimpleBar from "simplebar-react"

import { ToolArea } from "src/components/tools/ToolArea"
import { ToolBatchModeHeader } from "src/components/tools/ToolBatchModeHeader"
import { ToolHeader } from "src/components/tools/ToolHeader"
import { ToolRunner } from "src/components/tools/ToolRunner"
import { ToolTabbar } from "src/components/tools/ToolTabbar"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolSessionStore } from "src/stores/toolSessionStore"

import "./ToolPage.scss"

export const ToolPage: FC = observer(() => {
  if (!toolSessionStore.isInitialized || toolRunnerStore.getActiveTool().toolId === "") {
    return
  }

  return (
    <div className="ToolPage">
      <ToolRunner />
      <ToolTabbar />
      <ToolHeader />
      <ToolBatchModeHeader />

      <SimpleBar className="ToolPage-main-panel">
        <ToolArea />
      </SimpleBar>
    </div>
  )
})
