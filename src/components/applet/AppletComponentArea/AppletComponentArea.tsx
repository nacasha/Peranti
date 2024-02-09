import { observer } from "mobx-react"
import { type FC } from "react"

import { activeAppletStore } from "src/services/active-applet-store.ts"

import { AppletContextMenu } from "../AppletContextMenu/index.ts"

import { AppletComponentAreaBody } from "./AppletComponentAreaBody.tsx"
import { AppletComponentAreaContainer } from "./AppletComponentAreaContainer.tsx"

import "./AppletComponentArea.scss"

export const AppletComponentArea: FC = observer(() => {
  const activeApplet = activeAppletStore.getActiveApplet()
  const { isDeleted, renderCounter, layoutSetting, sessionId } = activeApplet
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
})
