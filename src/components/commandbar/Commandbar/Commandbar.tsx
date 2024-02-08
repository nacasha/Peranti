import { Command } from "cmdk"
import { type FC } from "react"

import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { useSelector } from "src/hooks/useSelector"
import { appletStore } from "src/services/applet-store"
import { commandbarService } from "src/services/commandbar-service"
import { hotkeysStore } from "src/services/hotkeys-store"
import { sessionStore } from "src/services/session-store"

import "./Commandbar.scss"

export const Commandbar: FC = () => {
  const isOpen = useSelector(() => commandbarService.isOpen)
  const items = useSelector(() => commandbarService.items)

  const handleChange = (value: boolean) => {
    commandbarService.setIsOpen(value)
  }

  const handleSelectitem = (appletId: string) => {
    const appletConstructor = appletStore.mapOfLoadedApplets[appletId]
    if (appletConstructor) {
      sessionStore.findOrCreateSession(appletConstructor)
    }
    commandbarService.setIsOpen(false)
  }

  useHotkeysModified(hotkeysStore.keys.OPEN_COMMANDBAR, (event) => {
    event.preventDefault()
    commandbarService.setIsOpen(true)
  })

  return (
    <Command.Dialog open={isOpen} onOpenChange={handleChange} onClickCapture={() => { console.log("ok") }}>
      <Command.Input autoFocus placeholder="Type a command or search..." />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        {items.map(({ key, label, shortcut }) => {
          return (
            <Command.Item
              onSelect={handleSelectitem}
              key={key}
              value={key}
            >
              <div className="text">
                {label}
              </div>
              {shortcut && (
                <div>
                  {shortcut.map((key) => {
                    return <kbd key={key}>{key}</kbd>
                  })}
                </div>
              )}
            </Command.Item>
          )
        })}
      </Command.List>
    </Command.Dialog>
  )
}
