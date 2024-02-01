import { clsx } from "clsx"
import { type FC } from "react"

import { useSelector } from "src/hooks/useSelector.js"
import { interfaceStore } from "src/stores/interfaceStore.js"
import { toolRunnerStore } from "src/stores/toolRunnerStore.js"

interface ToolAreaContainerProps {
  children: React.ReactNode
}

export const ToolAreaContainer: FC<ToolAreaContainerProps> = ({ children }) => {
  const isBatchEnabled = useSelector(() => toolRunnerStore.getActiveTool().isBatchModeEnabled)
  const layoutSetting = useSelector(() => toolRunnerStore.getActiveTool().layoutSetting)
  const textAreaWordWrap = useSelector(() => interfaceStore.textAreaWordWrap)

  const { direction, reversed, gridTemplate } = layoutSetting

  const computedLayoutDirection = isBatchEnabled ? "horizontal-batch" : direction
  const isLayoutHorizontal = computedLayoutDirection === "horizontal"

  const computedStyles = isLayoutHorizontal
    ? { gridTemplateColumns: gridTemplate }
    : { gridTemplateRows: gridTemplate }

  const classNames = { "text-area-word-wrap": textAreaWordWrap, reversed }

  return (
    <div
      className={clsx("ToolArea", computedLayoutDirection, classNames)}
      style={computedStyles}
    >
      {children}
    </div>
  )
}
