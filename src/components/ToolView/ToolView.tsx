import { type FC } from "react"
import { ToolHeader } from "../ToolHeader"
import { ToolArea } from "../ToolArea"
import { ToolRunner } from "../ToolRunner"

import "./ToolView.scss"
import { ToolHistoryList } from "../ToolHistoryList"

export const ToolView: FC = () => {
  return (
    <div className="ToolView">
      <ToolRunner />

      <div className="ToolView-main-panel">
        <ToolHeader />
        <ToolArea />
      </div>

      <ToolHistoryList />
    </div>
  )
}
