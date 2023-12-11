import { type FC } from "react"
import { ToolAreaInput } from "src/components/ToolAreaInput"
import { ToolAreaOutput } from "src/components/ToolAreaOutput"

import "./ToolArea.scss"
import { toolStore } from "src/store/toolStore"
import { observer } from "mobx-react"
import { interfaceStore } from "src/store/interfaceStore"

export const ToolArea: FC = observer(() => {
  const { layout = "side-by-side" } = toolStore.getActiveTool()
  const textAreaWordWrap = interfaceStore.textAreaWordWrap

  return (
    <div className={(`ToolArea separated-input-output ${layout}`).concat(textAreaWordWrap ? " text-area-word-wrap" : "")}>
      <ToolAreaInput />
      <ToolAreaOutput />
    </div>
  )
})
