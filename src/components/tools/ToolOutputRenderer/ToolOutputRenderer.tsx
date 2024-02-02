import { toJS } from "mobx"
import { type FC } from "react"
import { useContextMenu } from "react-contexify"
import "react-contexify/ReactContexify.css"

import { ContextMenuKeys } from "src/constants/context-menu-keys"
import { useSelector } from "src/hooks/useSelector"
import { toolOutputComponents } from "src/services/toolOutputComponents"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
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

  const activeTool = useSelector(() => toolRunnerStore.getActiveTool())
  const outputValue = useSelector(() => activeTool.outputValues[toolOutput.key] ?? "")
  const isBatchModeEnabled = useSelector(() => activeTool.isBatchModeEnabled)
  const batchModeOutputKey = useSelector(() => activeTool.batchModeOutputKey)

  const initialState = activeTool.outputFieldsState[toolOutput.key]

  const outputComponent = toolOutputComponents[toolOutput.component]
  const Component: FC<OutputComponentProps<any>> = outputComponent[isBatchModeEnabled ? "batchComponent" : "component"]

  const handleStateChange = (state: unknown) => {
    activeTool.setOutputFieldState(toolOutput.key, state)
  }

  const handleContextMenu = (event: any) => {
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
   * Only pass editor state props to some components that handle it,
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
