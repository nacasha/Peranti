import { type FC } from "react"

import { ToolArea } from "src/components/tools/ToolArea"
import { ToolHeader } from "src/components/tools/ToolHeader"
import { ToolHistoryList } from "src/components/tools/ToolHistoryList"
import { ToolRunner } from "src/components/tools/ToolRunner"

import "./ToolPage.scss"

export const ToolPage: FC = () => {
  return (
    <div className="ToolPage">
      <ToolRunner />

      <div className="ToolPage-main-panel">
        <ToolHeader />
        <ToolArea />
      </div>

      <ToolHistoryList />
    </div>
  )
}