import { Console, Hook, Unhook } from "console-feed"
import { useState, type FC, useEffect, useRef } from "react"

import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons"
import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { useSelector } from "src/hooks/useSelector"
import { bottomPanelService } from "src/services/bottom-panel-service"
import { hotkeysStore } from "src/services/hotkeys-store"
import { interfaceStore } from "src/services/interface-store"

import "./BottomPanel.scss"

export const BottomPanel: FC = () => {
  const isOpen = useSelector(() => bottomPanelService.isOpen)
  const isDarkTheme = useSelector(() => interfaceStore.isDarkTheme)

  const contentRef = useRef<HTMLDivElement>(null)
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
      (log) => {
        setLogs((currLogs) => {
          const newLogs = [...currLogs, log]
          return newLogs.slice(-100)
        })
      },
      false,
      100
    )

    return () => {
      Unhook(hookedConsole)
    }
  }, [])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo(0, contentRef.current.scrollHeight + 200)
    }
  }, [logs[0], contentRef.current])

  if (!isOpen) {
    return null
  }

  return (
    <div className="BottomPanel">
      <div className="BottomPanel-header">
        <div className="BottomPanel-title">Console Output</div>
        <ButtonIcon icon={Icons.Close} onClick={handleClickClose} />
      </div>
      <div ref={contentRef} className="BottomPanel-content">
        <Console logs={logs} variant={isDarkTheme ? "dark" : "light"} />
      </div>
    </div>
  )
}
