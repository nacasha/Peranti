import { Console, Hook, Unhook } from "console-feed"
import { useState, type FC, useEffect } from "react"

import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons"
import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { useSelector } from "src/hooks/useSelector"
import { bottomPanelService } from "src/services/bottom-panel-service"
import { hotkeysStore } from "src/services/hotkeys-store"
import { interfaceStore } from "src/services/interface-store"

import { bottomPanelClasses } from "./BottomPanel.css"

export const BottomPanel: FC = () => {
  const isOpen = useSelector(() => bottomPanelService.isOpen)
  const isDarkTheme = useSelector(() => interfaceStore.isDarkTheme)

  const [logs, setLogs] = useState<any[]>([])

  const handleClickClose = () => {
    bottomPanelService.hide()
  }

  useHotkeysModified(hotkeysStore.keys.BOTTOM_PANEL, (event) => {
    event.preventDefault()
    bottomPanelService.toggleIsOpen()
  })

  useEffect(() => {
    const hookedConsole = Hook(
      window.console,
      (log) => { setLogs((currLogs) => [...currLogs, log]) },
      false,
      100
    )

    return () => {
      Unhook(hookedConsole)
    }
  }, [])

  if (!isOpen) {
    return null
  }

  return (
    <div className={bottomPanelClasses.root}>
      <div className={bottomPanelClasses.header}>
        <div className={bottomPanelClasses.title}>Console Output</div>
        <ButtonIcon icon={Icons.Close} onClick={handleClickClose} />
      </div>
      <div className={bottomPanelClasses.content}>
        <Console logs={logs} variant={isDarkTheme ? "dark" : "light"} />
      </div>
    </div>
  )
}
