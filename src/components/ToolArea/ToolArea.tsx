import { type FC } from "react"
import { ToolAreaInput } from "src/components/ToolAreaInput"
import { ToolAreaOutput } from "src/components/ToolAreaOutput"

import "./ToolArea.scss"
import { toolStore } from "src/store/toolStore"

export const ToolArea: FC = () => {
  const { layout = "side-by-side" } = toolStore.getActiveTool()

  return (
    <div className={`ToolArea ${layout}`}>
      <ToolAreaInput />
      <ToolAreaOutput />
    </div>
  )
}
