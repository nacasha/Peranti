import { type FC } from "react"

import { ToolArea } from "../ToolArea"
import { ToolHeader } from "../ToolHeader"
import { ToolHistoryList } from "../ToolHistoryList"
import { ToolRunner } from "../ToolRunner"

import "./ToolView.scss"

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
