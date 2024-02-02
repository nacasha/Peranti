import { toJS } from "mobx"
import { type FC } from "react"
import { useContextMenu } from "react-contexify"

import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { useSelector } from "src/hooks/useSelector"
import { toolInputComponents } from "src/services/toolInputComponents"
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
  const { show } = useContextMenu()

  const activeTool = toolRunnerStore.getActiveTool()
  const defaultValue = activeTool.inputValues[toolInput.key] ?? toolInput.defaultValue
  const initialState = activeTool.inputFieldsState[toolInput.key]
  const isBatchModeEnabled = useSelector(() => activeTool.isBatchModeEnabled)
  const batchModeInputKey = useSelector(() => activeTool.batchModeInputKey)

  const outputComponent = toolInputComponents[toolInput.component]
  const Component: FC<InputComponentProps<any>> = outputComponent[isBatchModeEnabled ? "batchComponent" : "component"]

  const handleSUbmit = (val: unknown) => {
    activeTool.setInputValue(toolInput.key, val)
  }

  const handleStateChange = (state: unknown) => {
    activeTool.setInputFieldState(toolInput.key, state)
  }

  const handleContextMenu = (event: any) => {
    show({
      event,
      id: ContextMenuKeys.ToolOutput,
      props: {
        toolInput: toJS(toolInput),
        component: outputComponent
      }
    })
  }

  /**
   * Only pass editor state props to some components that handle it,
   * This is needed to suppress `Unknown event handler property` warning on console
   */
  const additionalProps: Record<string, any> = {}
  if (["Code"].includes(toolInput.component)) {
    additionalProps.initialState = initialState
    additionalProps.onStateChange = handleStateChange
  }

  if (isBatchModeEnabled && batchModeInputKey !== toolInput.key) {
    return
  }

  return (
    <Component
      {...toolInput.props}
      key={toolInput.key}
      label={toolInput.label}
      defaultValue={defaultValue}
      readOnly={readOnly}
      onSubmit={handleSUbmit}
      onContextMenu={handleContextMenu}
      {...additionalProps}
    />
  )
}
