import { type FC } from "react"

import { useSelector } from "src/hooks/useSelector.ts"
import { activeAppletStore } from "src/services/active-applet-store.ts"

import { AppletContextMenu } from "../AppletContextMenu/index.ts"

import { AppletComponentAreaBody } from "./AppletComponentAreaBody.tsx"
import { AppletComponentAreaContainer } from "./AppletComponentAreaContainer.tsx"

import "./AppletComponentArea.scss"

export const AppletComponentArea: FC = () => {
  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())

  const isDeleted = useSelector(() => activeAppletStore.getActiveApplet().isDeleted)
  const renderCounter = useSelector(() => activeAppletStore.getActiveApplet().renderCounter)

  const { layoutSetting, sessionId } = activeApplet
  const { inputAreaDirection, outputAreaDirection } = layoutSetting

  const inputFields = activeApplet.getInputFields()
  const outputFields = activeApplet.getOutputFields()

  return (
    <AppletComponentAreaContainer>
      <AppletContextMenu />

      <AppletComponentAreaBody
        appletSessionId={sessionId.concat(renderCounter.toString())}
        inputs={inputFields}
        outputs={outputFields}
        inputLayoutDirection={inputAreaDirection}
        outputLayoutDirection={outputAreaDirection}
        readOnly={isDeleted}
      />
    </AppletComponentAreaContainer>
  )
}
