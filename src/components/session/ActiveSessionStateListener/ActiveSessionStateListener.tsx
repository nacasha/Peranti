import { observer } from "mobx-react"
import { useEffect, type FC, useRef } from "react"

import { type Applet } from "src/models/Applet"
import { activeAppletStore } from "src/services/active-applet-store"

export const ActiveSessionStateListener: FC = observer(() => {
  const activeApplet = activeAppletStore.getActiveApplet()
  const previousApplet = useRef<Applet | null>(null)

  useEffect(() => {
    if (activeApplet.autoRun) {
      const isAppletChanged = previousApplet.current?.sessionId !== activeApplet.sessionId
      const { isInputValuesModified, isAutoRunAndFirstTime } = activeApplet

      if (isAppletChanged && isAutoRunAndFirstTime) {
        activeAppletStore.run()
      } else if (!isAppletChanged && isInputValuesModified) {
        activeAppletStore.run()
      }
    }
  }, [activeApplet.inputValues])

  useEffect(() => {
    if (activeApplet.sessionId !== previousApplet.current?.sessionId) {
      previousApplet.current = activeApplet
    }
  }, [activeApplet.sessionId])

  return null
})
