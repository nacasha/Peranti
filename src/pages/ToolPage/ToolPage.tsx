import { type FC } from "react"
import SimpleBar from "simplebar-react"

import { ActiveSessionStateListener } from "src/components/session/ActiveSessionStateListener"
import { ToolArea } from "src/components/tools/ToolArea"
import { ToolBatchModeHeader } from "src/components/tools/ToolBatchModeHeader"
import { ToolHeader } from "src/components/tools/ToolHeader"

import "./ToolPage.scss"

export const ToolPage: FC = () => {
  return (
    <div className="ToolPage">
      <ActiveSessionStateListener />
      <ToolHeader />
      <ToolBatchModeHeader />

      <SimpleBar className="ToolPage-main-panel">
        <ToolArea />
      </SimpleBar>
    </div>
  )
}
