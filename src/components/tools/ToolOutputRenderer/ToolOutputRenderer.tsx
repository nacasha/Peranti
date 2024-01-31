import { type FC } from "react"

import { listOfOutputComponent } from "src/components/outputs"
import { useSelector } from "src/hooks/useSelector"
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
  const activeTool = useSelector(() => toolRunnerStore.getActiveTool())

  const outputValue = useSelector(() => activeTool.outputValues[toolOutput.key] ?? "")
  const initialState = activeTool.outputFieldsState[toolOutput.key]

  const onStateChange = (state: unknown) => {
    activeTool.setOutputFieldState(toolOutput.key, state)
  }

  const Component: FC<OutputComponentProps<any>> = listOfOutputComponent[toolOutput.component]

  /**
   * Only pass editor state props to some components that handle it,
   * This is needed to suppress `Unknown event handler property` warning on console
   */
  const additionalProps: Record<string, any> = {}
  if (["Code"].includes(toolOutput.component)) {
    additionalProps.initialState = initialState
    additionalProps.onStateChange = onStateChange
  }

  return (
    <Component
      {...toolOutput.props}
      key={toolOutput.key}
      label={toolOutput.label}
      value={outputValue}
      {...additionalProps}
    />
  )
}
