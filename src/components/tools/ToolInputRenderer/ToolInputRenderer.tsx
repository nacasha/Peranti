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

    /**
     * TODO
     * Manual call hydrate store to pu tinto storage because Code input
     * component won't serialize when only change the selection :(
     */
    if (toolInput.component === "Code") {
      // void activeTool.hydrateStore()
    }
  }

  const Component: FC<InputComponentProps<any>> = listOfInputComponent[toolInput.component]

  /**
   * Only pass the state related props because not all components handling the editor state
   */
  const additionalProps: Record<string, any> = {}
  if (initialState) additionalProps.initialState = initialState
  if (toolInput.component === "Code") {
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
