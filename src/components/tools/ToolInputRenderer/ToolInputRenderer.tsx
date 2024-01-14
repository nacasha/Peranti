import { observer } from "mobx-react"
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
   * Initial value of input
   */
  initialValue: any

  /**
   * Indicates the field is read only, used when viewing a history
   */
  readOnly?: boolean
}

export const ToolInputRenderer: FC<ToolInputRendererProps> = observer((props) => {
  const { component, field, props: componentProps, initialValue, label } = props
  const activeTool = toolRunnerStore.getActiveTool()

  const Component: FC<InputComponentProps> = (listOfInputComponent as any)[component]
  const inputValue = toolRunnerStore.getActiveTool().inputValues[field]

  const onSubmit = (val: any) => {
    activeTool.setInputValue(field, val)
  }

  return (
    <Component
      {...componentProps}
      label={label}
      key={field}
      initialValue={inputValue ?? initialValue}
      onSubmit={onSubmit}
      readOnly={activeTool.isReadOnly}
    />
  )
})
