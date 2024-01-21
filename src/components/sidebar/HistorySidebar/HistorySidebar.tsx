import { type FC } from "react"

import { ToolHistoryList } from "src/components/tools/ToolHistoryList"

export const HistorySidebar: FC = () => {
  return (
    <div className="HistorySidebar">
      <div className="AppSidebarContent-title">History</div>
      <ToolHistoryList showAllHistory />
    </div>
  )
}
