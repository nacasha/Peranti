import { type FC } from "react"

import { ToolRunner } from "src/components/ToolRunner"
import { ToolHeader } from "src/components/ToolHeader"
import { ToolArea } from "src/components/ToolArea"
import { ToolHistoryList } from "src/components/ToolHistoryList"
import { AppSidebarContent } from "src/components/AppSidebarContent"
import "./ToolPage.scss"

export const ToolPage: FC = () => {
  return (
    <div className="ToolPage">
      <ToolRunner />
      <AppSidebarContent />

      <div className="ToolPage-main-panel">
        <ToolHeader />
        <ToolArea />
      </div>

      <ToolHistoryList />
    </div>
  )
}
