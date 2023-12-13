import { clsx } from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"

import { interfaceStore } from "src/stores/interfaceStore"
import { toolStore } from "src/stores/toolStore"

import { ToolAreaInput } from "../ToolAreaInput"
import { ToolAreaOutput } from "../ToolAreaOutput"

import "./ToolArea.scss"

export const ToolArea: FC = observer(() => {
  const { layout = "side-by-side" } = toolStore.getActiveTool()
  const textAreaWordWrap = interfaceStore.textAreaWordWrap

  return (
    <div className={clsx("ToolArea", layout, textAreaWordWrap && "text-area-word-wrap")}>
      <ToolAreaInput />
      <ToolAreaOutput />
    </div>
  )
})
