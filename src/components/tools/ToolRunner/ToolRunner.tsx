import { observer } from "mobx-react"
import { type FC } from "react"

import { toolStore } from "src/stores/toolStore"

import { ToolRunnerAuto } from "./ToolRunnerAuto.js"
import { ToolRunnerManual } from "./ToolRunnerManual.js"

export const ToolRunner: FC = observer(() => {
  if (toolStore.isRunModeAuto) {
    return <ToolRunnerAuto />
  }
  return <ToolRunnerManual />
})
