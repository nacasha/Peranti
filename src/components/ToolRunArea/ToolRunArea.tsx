import { type FC } from "react"
import { AreaInput } from "src/components/AreaInput"
import { AreaOutput } from "src/components/AreaOutput"

import "./ToolRunArea.scss"
import { rootStore } from "src/store/root-store"

export const ToolRunArea: FC = () => {
  const { layout = "side-by-side" } = rootStore.tool.use.currentToolOrEmpty()

  return (
    <div className={`ToolRunArea ${layout}`}>
      <AreaInput />
      <AreaOutput />
    </div>
  )
}
