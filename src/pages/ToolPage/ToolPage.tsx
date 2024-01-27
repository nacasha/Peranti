import { type FC } from "react"
import SimpleBar from "simplebar-react"

import { ToolArea } from "src/components/tools/ToolArea"
import { ToolBatchModeHeader } from "src/components/tools/ToolBatchModeHeader"
import { ToolHeader } from "src/components/tools/ToolHeader"
import { ToolRunner } from "src/components/tools/ToolRunner"
import { ToolTabbar } from "src/components/tools/ToolTabbar"
import { useSelector } from "src/hooks/useSelector"
import { toolRunnerStore } from "src/stores/toolRunnerStore"

import "./ToolPage.scss"

export const ToolPage: FC = () => {
  const activeTool = useSelector(() => toolRunnerStore.getActiveTool())

  if (activeTool.toolId === "") {
    return null
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
}
