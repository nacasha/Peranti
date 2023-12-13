import { observer } from "mobx-react"

import { toolStore } from "src/stores/toolStore"

import { ToolAdapterOutput } from "../ToolAdapterOutput"

export const ToolAreaOutput = observer(() => {
  const activeTool = toolStore.getActiveTool()
  const { outputs } = activeTool

  return (
    <div className="ToolAreaOutput">
      {outputs.map((output) => (
        <ToolAdapterOutput
          key={activeTool.instanceId + output.key}
          field={output.key}
          component={output.component}
          props={output.props}
        />
      ))}
    </div>
  )
})