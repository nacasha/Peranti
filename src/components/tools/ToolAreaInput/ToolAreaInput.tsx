import { clsx } from "clsx"
import { observer } from "mobx-react"

import { toolStore } from "src/stores/toolStore"

import { ToolAdapterInput } from "../ToolAdapterInput"

export const ToolAreaInput = observer(() => {
  const activeTool = toolStore.getActiveTool()
  const { inputs, inputsLayoutDirection } = activeTool

  return (
    <div className={clsx("ToolAreaInput", inputsLayoutDirection)}>
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
