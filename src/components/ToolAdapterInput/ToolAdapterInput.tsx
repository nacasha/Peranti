import { observer } from "mobx-react"
import { type FC } from "react"
import { listOfInputComponent } from "src/components/Input"
import { toolStore } from "src/stores/toolStore"
import { type InputComponentProps } from "src/types/InputComponentProps"

interface ToolAdapterInputProps {
  /**
   * Name of component to be rendered
   */
  component: string

  /**
   * Key of field
   */
  field: string

  /**
   * Component properties to be passed
   */
  props: any

  /**
   * Initial value of input
   */
  initialValue: any

  /**
   * Indicates the field is read only, usually used when viewing a history
   */
  readOnly?: boolean
}

export const ToolAdapterInput: FC<ToolAdapterInputProps> = observer((props) => {
  const { component, field, props: componentProps, initialValue } = props
  const activeTool = toolStore.getActiveTool()

  const Component: FC<InputComponentProps> = (listOfInputComponent as any)[component]
  const inputValue = toolStore.getActiveTool().inputParams[field]

  const onSubmit = (val: any) => {
    activeTool.setInputParamsValue(field, val)
  }

  return (
    <Component
      {...componentProps}
      key={field}
      initialValue={inputValue ?? initialValue}
      onSubmit={onSubmit}
      readOnly={activeTool.isReadOnly}
    />
  )
})
