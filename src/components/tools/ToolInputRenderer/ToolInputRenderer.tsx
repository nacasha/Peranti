import { type FC } from "react"

import { listOfInputComponent } from "src/components/inputs"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { type InputComponentProps } from "src/types/InputComponentProps"
import { type ToolInput } from "src/types/ToolInput"

interface ToolInputRendererProps {
  /**
   * Tool input definition
   */
  toolInput: ToolInput

  /**
   * Indicates the field is read only, used when viewing a deleted session
   */
  readOnly?: boolean
}

export const ToolInputRenderer: FC<ToolInputRendererProps> = (props) => {
  const { readOnly, toolInput } = props
  const activeTool = toolRunnerStore.getActiveTool()

  const defaultValue = activeTool.inputValues[toolInput.key] ?? toolInput.defaultValue
  const initialState = activeTool.inputFieldsState[toolInput.key]

  const onSubmit = (val: unknown) => {
    activeTool.setInputValue(toolInput.key, val)
  }

  const onStateChange = (state: unknown) => {
    activeTool.setInputFieldState(toolInput.key, state)
  }

  const Component: FC<InputComponentProps<any>> = listOfInputComponent[toolInput.component]

  /**
   * Only pass editor state props to some components that handle it,
   * This is needed to suppress `Unknown event handler property` warning on console
   */
  const additionalProps: Record<string, any> = {}
  if (["Code"].includes(toolInput.component)) {
    additionalProps.initialState = initialState
    additionalProps.onStateChange = onStateChange
  }

  return (
    <Component
      {...toolInput.props}
      label={toolInput.label}
      key={toolInput.key}
      defaultValue={defaultValue}
      onSubmit={onSubmit}
      readOnly={readOnly}
      {...additionalProps}
    />
  )
}
