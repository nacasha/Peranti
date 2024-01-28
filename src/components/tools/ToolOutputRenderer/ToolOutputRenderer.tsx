import { type FC } from "react"

import { listOfOutputComponent } from "src/components/outputs"
import { useSelector } from "src/hooks/useSelector"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { type OutputComponentProps } from "src/types/OutputComponentProps.ts"

interface ToolOutputRendererProps {
  /**
   * Name of output component to be rendered
   */
  component: string

  /**
   * Unique key of field
   */
  field: string

  /**
   * Label of field
   */
  label: string

  /**
   * Component properties to be passed
   */
  props: any
}

export const ToolOutputRenderer: FC<ToolOutputRendererProps> = (props) => {
  const { component, field, props: componentProps, label } = props

  const Component: FC<OutputComponentProps> = (listOfOutputComponent as any)[component]
  const outputValue = useSelector(() => toolRunnerStore.getActiveTool()?.outputValues?.[field])

  return (
    <Component
      {...componentProps}
      key={field}
      label={label}
      value={outputValue ?? ""}
    />
  )
}
