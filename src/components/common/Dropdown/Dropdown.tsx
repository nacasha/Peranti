import { type ReactNode, useId, useRef, useState, useEffect } from "react"
import { Item, type ItemParams, Menu, useContextMenu } from "react-contexify"
import { flushSync } from "react-dom"

import { Icons } from "src/constants/icons"

import "./Dropdown.scss"

interface Option<T = string> {
  label: string
  value: T
}

interface DropdownProps<T = string> {
  options: Array<Option<T>>
  value?: string
  defaultValue?: string
  onChange?: (value: T) => void
  width?: string | number
  readOnly?: boolean

  /**
   * Show a search box above the options that filters them by label
   */
  searchable?: boolean
}

/**
 * Tallest the option list gets; a shorter window caps it at the space left
 */
const MAX_MENU_HEIGHT = 360

/**
 * Least room worth opening into below the trigger before trying above
 */
const MIN_MENU_HEIGHT = 160

const GAP = 2
const WINDOW_MARGIN = 8

/**
 * Menu clones its direct children with `propsFromTrigger` and `triggerEvent`;
 * this takes them so they don't end up as attributes on a DOM element
 */
const MenuSection = (props: { className: string, children: ReactNode, propsFromTrigger?: unknown, triggerEvent?: unknown }) => (
  <div className={props.className}>{props.children}</div>
)

export const Dropdown: <T extends string>(props: DropdownProps<T>) => JSX.Element = (props) => {
  const { options, value, defaultValue, onChange, readOnly, width = 130, searchable = false } = props

  const id = useId()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedValue, setSelectedValue] = useState(() => defaultValue)
  const [query, setQuery] = useState("")
  const [placement, setPlacement] = useState({ width: 0, maxHeight: MAX_MENU_HEIGHT, above: false })

  const { show, hideAll } = useContextMenu({ id })

  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const normalizedQuery = query.trim().toLowerCase()
  const isMatch = (option: Option<any>) => !normalizedQuery || option.label.toLowerCase().includes(normalizedQuery)
  const matchCount = options.filter(isMatch).length

  /**
   * Opens below the trigger, or above it when there's more room there and
   * not enough below; the list is capped to the room it gets and scrolls
   */
  function getMenuPosition() {
    if (!triggerRef.current) return { x: 0, y: 0 }
    const { left, top, bottom, width } = triggerRef.current.getBoundingClientRect()
    const below = window.innerHeight - bottom - GAP - WINDOW_MARGIN
    const above = top - GAP - WINDOW_MARGIN
    const isAbove = below < MIN_MENU_HEIGHT && above > below
    const maxHeight = Math.max(0, Math.min(MAX_MENU_HEIGHT, isAbove ? above : below))

    flushSync(() => {
      setPlacement({ width, maxHeight, above: isAbove })
      setQuery("")
    })

    // Opening above anchors the menu's bottom edge at the trigger (see the
    // `DropdownMenu-above` style), so `y` is the trigger's top either way
    return { x: left, y: isAbove ? top - GAP : bottom + GAP }
  }

  const open = (e: React.MouseEvent | React.KeyboardEvent) => {
    show({
      event: e,
      position: getMenuPosition()
    })
  }

  const handleMenuTrigger = (e: React.MouseEvent) => {
    if (isVisible || readOnly) {
      hideAll()
      return
    }
    open(e)
  }

  const handleKeyboard = (e: React.KeyboardEvent) => {
    switch (e.key) {
    case "Enter":
      if (!readOnly) open(e)
      break
    case "Escape":
      if (isVisible) {
        hideAll()
      }
      break
    }
  }

  const select = (option: Option<any>) => {
    setSelectedValue(option.value)
    if (onChange) {
      onChange(option.value)
    }
    hideAll()
  }

  const handleSelect = (params: ItemParams<any, Option<any>>) => {
    if (params.data) {
      select(params.data)
    } else {
      hideAll()
    }
  }

  /**
   * The menu closes on Enter and Space, and on any click, wherever they
   * happen; inside the search box they belong to the box
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
    case "Enter": {
      e.preventDefault()
      e.stopPropagation()
      const first = options.find(isMatch)
      if (first) select(first)
      break
    }
    case "ArrowDown": {
      // Into the list, where the menu's own arrow keys take over
      e.preventDefault()
      e.stopPropagation()
      listRef.current?.querySelector<HTMLElement>(".contexify_item:not(.hidden)")?.focus()
      break
    }
    case "Escape":
      break
    default:
      e.stopPropagation()
    }
  }

  const handleVisibility = (isVisible: boolean) => {
    setIsVisible(isVisible)
  }

  /**
   * Close when the page scrolls under the menu, not when the list itself does
   */
  const handleScroll = (event: Event) => {
    const target = event.target
    if (target instanceof Node && listRef.current?.contains(target)) return
    hideAll()
  }

  const getSelectionLabel = () => {
    const selectionOption = options.filter((option) => option.value === selectedValue)
    if (selectionOption.length > 0) {
      return selectionOption[0].label
    }
    return ""
  }

  useEffect(() => {
    if (value) {
      if (selectedValue !== value) {
        setSelectedValue(value)
      }
    }
  }, [value])

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("scroll", handleScroll, { capture: true })

      return () => {
        document.removeEventListener("scroll", handleScroll, { capture: true })
      }
    }
  }, [isVisible])

  // On open: the search box takes the keys, and the list shows the selected option
  useEffect(() => {
    if (!isVisible) return
    if (searchable) searchRef.current?.focus()
    listRef.current?.querySelector(".contexify_item.selected")?.scrollIntoView({ block: "nearest" })
  }, [isVisible])

  return (
    <div>
      <button
        className="Dropdown"
        id={`label-${id}`}
        onClick={handleMenuTrigger}
        onKeyDown={handleKeyboard}
        tabIndex={0}
        ref={triggerRef}
        aria-haspopup="true"
        aria-expanded={isVisible}
        style={{ minWidth: width }}
      >
        <span>{getSelectionLabel()}</span>
        <span>
          <Icons.ChevronDown size={14} aria-hidden />
        </span>
      </button>

      <Menu
        className={`DropdownMenu ${placement.above ? "DropdownMenu-above" : ""}`}
        id={id}
        style={{ minWidth: placement.width, maxWidth: placement.width, maxHeight: placement.maxHeight }}
        onVisibilityChange={handleVisibility}
        // Placement and height are worked out above; the library's own check
        // would shift the menu off the trigger instead
        disableBoundariesCheck
      >
        {searchable && (
          <MenuSection className="DropdownMenu-search">
            <Icons.Search size={13} aria-hidden />
            <input
              ref={searchRef}
              type="text"
              value={query}
              placeholder="Search"
              spellCheck={false}
              aria-label="Search options"
              onChange={(e) => { setQuery(e.target.value) }}
              onKeyDown={handleSearchKeyDown}
              onClick={(e) => { e.stopPropagation() }}
            />
          </MenuSection>
        )}
        <MenuSection className="DropdownMenu-list">
          <div ref={listRef} className="DropdownMenu-scroll">
            {options.map((option) => (
              <Item
                key={option.value}
                onClick={handleSelect}
                data={option}
                className={[option.value === selectedValue ? "selected" : "", isMatch(option) ? "" : "hidden"].join(" ")}
              >
                <span className="DropdownMenu-label">{option.label}</span>
                {option.value === selectedValue && (
                  <Icons.Check className="DropdownMenu-check" size={14} aria-hidden />
                )}
              </Item>
            ))}
            {matchCount === 0 && <div className="DropdownMenu-empty">No matches</div>}
          </div>
        </MenuSection>
      </Menu>
    </div>
  )
}
