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

  const outputValue = useSelector(() => (
    toolRunnerStore.getActiveTool()?.outputValues?.[toolOutput.key]
  )) ?? ""

  const Component: FC<OutputComponentProps<any>> = listOfOutputComponent[toolOutput.component]

  return (
    <Component
      {...toolOutput.props}
      key={toolOutput.key}
      label={toolOutput.label}
      value={outputValue}
    />
  )
}
