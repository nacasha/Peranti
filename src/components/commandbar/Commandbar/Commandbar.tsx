import { Command } from "cmdk"
import Fuse from "fuse.js"
import { useState, type FC, useMemo, useEffect } from "react"

import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { useSelector } from "src/hooks/useSelector"
import { appletStore } from "src/services/applet-store"
import { commandbarService } from "src/services/commandbar-service"
import { hotkeysStore } from "src/services/hotkeys-store"
import { sessionStore } from "src/services/session-store"

import "./Commandbar.css"

import "./Commandbar.scss"

export const Commandbar: FC = () => {
  const isOpen = useSelector(() => commandbarService.isOpen)
  const items = useSelector(() => commandbarService.items)

  const [searchKeyword, setSearchKeyword] = useState("")
  const fuse = useMemo(() => new Fuse(items, {
    keys: ["label", "description"]
  }), [items])

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

  const filteredItems = useMemo(() => {
    return fuse.search(searchKeyword)
  }, [searchKeyword, fuse])

  useHotkeysModified(hotkeysStore.keys.OPEN_COMMANDBAR, (event) => {
    event.preventDefault()
    commandbarService.setIsOpen(true)
  })

  useEffect(() => {
    setSearchKeyword("")
  }, [isOpen])

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={handleChange}
      shouldFilter={false}
    >
      <Command.Input autoFocus value={searchKeyword} onValueChange={setSearchKeyword} />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        {filteredItems.map((item) => {
          const { key, label, description, shortcut } = item.item

          return (
            <Command.Item key={key} onSelect={handleSelectitem} value={key}>
              <div className="text">
                <div className="title">
                  {label}
                </div>
                {description && (
                  <div className="description">
                    {description}
                  </div>
                )}
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
