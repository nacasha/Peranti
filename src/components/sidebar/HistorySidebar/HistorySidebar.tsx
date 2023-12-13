import { type FC } from "react"

import { ToolHistoryList } from "src/components/tools/ToolHistoryList"

export const HistorySidebar: FC = () => {
  return (
    <div className="HistorySidebar">
      <ToolHistoryList showAllHistory />
    </div>
  )
}
