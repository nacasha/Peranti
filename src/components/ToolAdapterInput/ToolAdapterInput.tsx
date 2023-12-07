import { observer } from "mobx-react"
import { type FC } from "react"
import { listOfInputComponent } from "src/components/Input"
import { toolStore } from "src/store/toolStore"

interface InputComponentProps {
  component: string
  field: string
  props: any
  initialValue: any
}

export const ToolAdapterInput: FC<InputComponentProps> = observer((props) => {
  const { component, field, props: componentProps, initialValue } = props
  const activeTool = toolStore.getActiveTool()

  const Component = (listOfInputComponent as any)[component]
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
    />
  )
})
