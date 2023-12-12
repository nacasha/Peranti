import { observer } from "mobx-react"
import { ToolRunnerAuto } from "./ToolRunnerAuto"
import { ToolRunnerManual } from "./ToolRunnerManual"
import { toolStore } from "src/stores/toolStore"
import { type FC } from "react"

export const ToolRunner: FC = observer(() => {
  if (toolStore.isRunModeAuto) {
    return <ToolRunnerAuto />
  }
  return <ToolRunnerManual />
})
