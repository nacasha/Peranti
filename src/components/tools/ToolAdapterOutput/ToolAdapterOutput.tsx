import { observer } from "mobx-react"
import { type FC } from "react"

import { listOfOutputComponent } from "src/components/outputs"
import { toolStore } from "src/stores/toolStore"

interface ToolAdapterOutputProps {
  component: string
  field: string
  props: any
}

export const ToolAdapterOutput: FC<ToolAdapterOutputProps> = observer((props) => {
  const { component, field, props: componentProps } = props

  const Component = (listOfOutputComponent as any)[component]
  const outputValue = toolStore.getActiveTool().outputParams[field]

  return (
    <Component
      {...componentProps}
      key={field}
      output={outputValue ?? ""}
    />
  )
})
