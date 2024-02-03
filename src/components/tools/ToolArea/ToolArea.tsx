import { type FC } from "react"

import { useSelector } from "src/hooks/useSelector.ts"
import { toolRunnerStore } from "src/stores/toolRunnerStore.ts"

import { ToolContextMenu } from "../ToolContextMenu"

import { ToolAreaBody } from "./ToolAreaBody.tsx"
import { ToolAreaContainer } from "./ToolAreaContainer.tsx"

import "./ToolArea.scss"

export const ToolArea: FC = () => {
  const activeTool = useSelector(() => toolRunnerStore.getActiveTool())

  /**
   * These properties are observable, meaning the value can change at anytime
   * and component need to rerender the output
   */
  const isDeleted = useSelector(() => toolRunnerStore.getActiveTool().isDeleted)
  const renderCounter = useSelector(() => toolRunnerStore.getActiveTool().renderCounter)

  /**
   * These properties are readonly, meaning the value will not be updated while showing the tool
   * No need to use `useSelector`
   */
  const { layoutSetting, sessionId } = activeTool
  const { inputAreaDirection, outputAreaDirection } = layoutSetting

  const inputFields = activeTool.getInputFields()
  const outputFields = activeTool.getOutputFields()

  return (
    <ToolAreaContainer>
      <ToolContextMenu />

      <ToolAreaBody
        toolSessionId={sessionId.concat(renderCounter.toString())}
        inputs={inputFields}
        outputs={outputFields}
        inputLayoutDirection={inputAreaDirection}
        outputLayoutDirection={outputAreaDirection}
        readOnly={isDeleted}
      />
    </ToolAreaContainer>
  )
}
