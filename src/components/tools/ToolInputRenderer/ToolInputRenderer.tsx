import { type FC } from "react"

import { listOfInputComponent } from "src/components/inputs"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { type InputComponentProps } from "src/types/InputComponentProps"

interface ToolInputRendererProps {
  /**
   * Name of input component to be rendered
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

  /**
   * Default value of input
   */
  defaultValue: any

  /**
   * Indicates the field is read only, used when viewing a history
   */
  readOnly?: boolean
}

export const ToolInputRenderer: FC<ToolInputRendererProps> = (props) => {
  const { component, field, props: componentProps, defaultValue, label, readOnly } = props
  const activeTool = toolRunnerStore.getActiveTool()

  const Component: FC<InputComponentProps> = (listOfInputComponent as any)[component]
  const defaultValueFromTool = activeTool.inputValues[field]

  const onSubmit = (val: any) => {
    activeTool.setInputValue(field, val)
  }

  return (
    <Component
      {...componentProps}
      label={label}
      key={field}
      defaultValue={defaultValueFromTool ?? defaultValue}
      onSubmit={onSubmit}
      readOnly={readOnly}
    />
  )
}
