import { type FC } from "react"
import { ToolAreaInput } from "src/components/ToolAreaInput"
import { ToolAreaOutput } from "src/components/ToolAreaOutput"

import "./ToolArea.scss"
import { toolStore } from "src/store/toolStore"
import { observer } from "mobx-react"

export const ToolArea: FC = observer(() => {
  const { layout = "side-by-side" } = toolStore.getActiveTool()

  return (
    <div className={`ToolArea ${layout}`}>
      <ToolAreaInput />
      <ToolAreaOutput />
    </div>
  )
})
