import { observer } from "mobx-react"

import { toolStore } from "src/stores/toolStore"

import { ToolAdapterInput } from "../ToolAdapterInput"

export const ToolAreaInput = observer(() => {
  const activeTool = toolStore.getActiveTool()
  const { inputs } = activeTool

  return (
    <div className="ToolAreaInput">
      {inputs.map((input) => (
        <ToolAdapterInput
          key={activeTool.instanceId + input.key}
          field={input.key}
          component={input.component}
          props={input.props}
          initialValue={input.defaultValue}
          readOnly={true}
        />
      ))}
    </div>
  )
})
