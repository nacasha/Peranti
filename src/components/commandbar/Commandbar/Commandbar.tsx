import clsx from "clsx"
import { Command } from "cmdk"
import { useState, type FC, type KeyboardEvent, useMemo, useEffect, useLayoutEffect, useRef, useDeferredValue } from "react"

import { Icons } from "src/constants/icons"
import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { useSelector } from "src/hooks/useSelector"
import { type CommandbarFilter, commandbarService } from "src/services/commandbar-service"
import { hotkeysStore } from "src/services/hotkeys-store"
import { sessionStore } from "src/services/session-store"

import "./Commandbar.scss"

const FILTERS: Array<{ value: CommandbarFilter, label: string }> = [
  { value: "all", label: "All" },
  { value: "tabs", label: "Tabs" },
  { value: "tools", label: "Tools" },
  { value: "commands", label: "Commands" }
]

export const Commandbar: FC = () => {
  const isOpen = useSelector(() => commandbarService.isOpen)
  const tools = useSelector(() => commandbarService.tools)
  const sessions = useSelector(() => sessionStore.sessions.slice())
  const tabIndexVersion = useSelector(() => commandbarService.tabIndexVersion)

  const [searchKeyword, setSearchKeyword] = useState("")
  const [filter, setFilter] = useState<CommandbarFilter>("all")

  /**
   * Typing ">" switches to commands without touching the chosen filter,
   * so deleting it brings the previous filter back
   */
  const activeFilter = searchKeyword.startsWith(">") ? "commands" : filter

  /**
   * Searching tab inputs can be heavier than the rest, so let typing stay
   * responsive and render results at lower priority
   */
  const deferredKeyword = useDeferredValue(searchKeyword)

  const results = useMemo(() => {
    return commandbarService.search(deferredKeyword, filter)
  }, [deferredKeyword, filter, tools, sessions, tabIndexVersion])

  const close = () => {
    commandbarService.setIsOpen(false)
  }

  const handleChange = (value: boolean) => {
    commandbarService.setIsOpen(value)
  }

  useHotkeysModified(hotkeysStore.keys.OPEN_COMMANDBAR, (event) => {
    event.preventDefault()
    commandbarService.setIsOpen(true)
  })

  useEffect(() => {
    setSearchKeyword("")
    setFilter("all")
  }, [isOpen])

  const selectFilter = (next: CommandbarFilter) => {
    setFilter(next)

    // Drop the ">" prefix, otherwise it would keep forcing the commands filter
    if (searchKeyword.startsWith(">")) {
      setSearchKeyword(searchKeyword.slice(1).trimStart())
    }
  }

  /**
   * Tab / Shift+Tab cycles through the filters
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return
    event.preventDefault()

    const index = FILTERS.findIndex((f) => f.value === activeFilter)
    const offset = event.shiftKey ? FILTERS.length - 1 : 1
    const next = FILTERS[(index + offset) % FILTERS.length].value

    selectFilter(next)
  }

  const [open, setOpen] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const [selectedValue, setSelectedValue] = useState("")

  const firstKey = (
    results.tabs[0]?.key ??
    results.tools[0]?.key ??
    results.commands[0]?.key ??
    ""
  )

  /**
   * Results are filtered outside of cmdk (`shouldFilter={false}`), so cmdk cannot tell
   * that the list changed: it keeps the previously selected item and scrolls it back
   * into view, leaving the list parked in the middle. Re-select the first result and
   * pin the list to the top on every new search instead.
   */
  useLayoutEffect(() => {
    setSelectedValue(firstKey)

    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [results])

  useLayoutEffect(() => {
    if (!isOpen) {
      setOpen(isOpen)
    } else {
      setTimeout(() => {
        setOpen(isOpen)
      }, 1)
    }
  }, [isOpen])

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={handleChange}
      shouldFilter={false}
      loop
      value={selectedValue}
      onValueChange={setSelectedValue}
      className={clsx("Commandbar", { open })}
      onKeyDown={handleKeyDown}
    >
      <div className="Commandbar-input">
        <Icons.Search size={14} />
        <Command.Input
          autoFocus
          value={searchKeyword}
          onValueChange={setSearchKeyword}
          placeholder="Search tabs and tools  ·  type > for commands"
        />
      </div>
      <div className="Commandbar-filters">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            tabIndex={-1}
            className={clsx("Commandbar-filter", { active: item.value === activeFilter })}
            // Keep focus in the search input
            onMouseDown={(event) => { event.preventDefault() }}
            onClick={() => { selectFilter(item.value) }}
          >
            {item.label}
          </button>
        ))}
        <span className="Commandbar-filters-hint"><kbd>Tab</kbd> to switch</span>
      </div>
      <Command.List ref={listRef}>
        <Command.Empty>No results found.</Command.Empty>

        {results.tabs.length > 0 && (
          <Command.Group heading="open tabs">
            {results.tabs.map((tab) => (
              <Command.Item
                key={tab.key}
                value={tab.key}
                onSelect={() => { close(); void sessionStore.openSession(tab.session) }}
              >
                <span className="Commandbar-dot" />
                <span className="Commandbar-label">{tab.label}</span>
                {tab.excerpt && <span className="Commandbar-meta Commandbar-excerpt">{tab.excerpt}</span>}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {results.tools.length > 0 && (
          <Command.Group heading="tools">
            {results.tools.map((tool) => (
              <Command.Item
                key={tool.key}
                value={tool.key}
                onSelect={() => { close(); commandbarService.openTool(tool.appletId) }}
              >
                <span className="Commandbar-label">{tool.label}</span>
                <span className="Commandbar-meta">{tool.description ? tool.description : tool.category}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {results.commands.length > 0 && (
          <Command.Group heading="commands">
            {results.commands.map((command) => (
              <Command.Item
                key={command.key}
                value={command.key}
                onSelect={() => { close(); void command.run() }}
              >
                <span className="Commandbar-label">{command.label}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  )
}
