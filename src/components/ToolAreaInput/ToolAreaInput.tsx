import { observer } from "mobx-react"
import { ToolAdapterInput } from "../ToolAdapterInput"
import { toolStore } from "src/store/toolStore"

export const ToolAreaInput = observer(() => {
  const activeTool = toolStore.getActiveTool()
  const { inputs } = activeTool

  return (
    <div className="ToolAreaInput">
      {inputs.map((input) => (
        <ToolAdapterInput
          key={activeTool.id + input.key}
          field={input.key}
          component={input.component}
          props={input.props}
          initialValue={input.defaultValue}
        />
      ))}
    </div>
  )
})
