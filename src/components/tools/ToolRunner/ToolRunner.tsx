import { observer } from "mobx-react"
import { type FC } from "react"

import { toolStore } from "src/stores/toolStore"

import { ToolRunnerAuto } from "./ToolRunnerAuto"
import { ToolRunnerManual } from "./ToolRunnerManual"

export const ToolRunner: FC = observer(() => {
  if (toolStore.isRunModeAuto) {
    return <ToolRunnerAuto />
  }
  return <ToolRunnerManual />
})
