import { observer } from "mobx-react"
import { type FC } from "react"

import { listOfOutputComponent } from "src/components/outputs"
import { toolStore } from "src/stores/toolStore"

interface ToolOutputRendererProps {
  component: string
  field: string
  label: string
  props: any
}

export const ToolOutputRenderer: FC<ToolOutputRendererProps> = observer((props) => {
  const { component, field, props: componentProps, label } = props

  const Component = (listOfOutputComponent as any)[component]
  const outputValue = toolStore.getActiveTool().outputParams[field]

  return (
    <Component
      {...componentProps}
      key={field}
      label={label}
      output={outputValue ?? ""}
    />
  )
})
