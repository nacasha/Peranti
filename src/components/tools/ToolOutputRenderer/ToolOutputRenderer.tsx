import { toJS } from "mobx"
import { type FC } from "react"
import { useContextMenu } from "react-contexify"

import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { useSelector } from "src/hooks/useSelector"
import { toolComponentService } from "src/services/toolComponentService"
import { activeSessionStore } from "src/stores/activeSessionStore"
import { type OutputComponentProps } from "src/types/OutputComponentProps.ts"
import { type ToolOutput } from "src/types/ToolOutput"

interface ToolOutputRendererProps {
  /**
   * Tool output definition
   */
  toolOutput: ToolOutput
}

export const ToolOutputRenderer: FC<ToolOutputRendererProps> = (props) => {
  const { toolOutput } = props
  const { show } = useContextMenu()

  const activeTool = useSelector(() => activeSessionStore.getActiveTool())
  const outputValue = useSelector(() => activeTool.outputValues[toolOutput.key] ?? "")
  const isBatchModeEnabled = useSelector(() => activeTool.isBatchModeEnabled)
  const batchModeOutputKey = useSelector(() => activeTool.batchModeOutputKey)

  const initialState = activeTool.outputFieldsState[toolOutput.key]

  const outputComponent = toolComponentService.getOutputComponent(toolOutput.component, isBatchModeEnabled)
  const Component: FC<OutputComponentProps<any>> = outputComponent.component

  const handleStateChange = (state: unknown) => {
    activeTool.setOutputFieldState(toolOutput.key, state)
  }

  const handleContextMenu = (event: any) => {
    if (activeTool.isDeleted) {
      return
    }

    show({
      event,
      id: ContextMenuKeys.ToolOutput,
      props: {
        toolOutput: toJS(toolOutput),
        component: outputComponent
      }
    })
  }

  /**
   * Only pass editor state props to selected components that handle it,
   * This is needed to suppress `Unknown event handler property` warning on console
   */
  const additionalProps: Record<string, any> = {}
  if (["Code"].includes(toolOutput.component)) {
    additionalProps.initialState = initialState
    additionalProps.onStateChange = handleStateChange
  }

  if (isBatchModeEnabled && batchModeOutputKey !== toolOutput.key) {
    return
  }

  return (
    <Component
      {...toolOutput.props}
      key={toolOutput.key}
      label={toolOutput.label}
      value={outputValue}
      onContextMenu={handleContextMenu}
      {...additionalProps}
    />
  )
}
