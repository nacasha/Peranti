import { type FC } from "react"
import SimpleBar from "simplebar-react"

import { ToolArea } from "src/components/tools/ToolArea"
import { ToolBatchModeHeader } from "src/components/tools/ToolBatchModeHeader"
import { ToolHeader } from "src/components/tools/ToolHeader"
import { ToolRunner } from "src/components/tools/ToolRunner"

import "./ToolPage.scss"

export const ToolPage: FC = () => {
  return (
    <div className="ToolPage">
      <ToolRunner />
      <ToolHeader />
      <ToolBatchModeHeader />

      <SimpleBar className="ToolPage-main-panel">
        <ToolArea />
      </SimpleBar>
    </div>
  )
}
