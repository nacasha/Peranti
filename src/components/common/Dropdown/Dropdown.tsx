import { useId, useRef, useState, useEffect } from "react"
import { Item, type ItemParams, Menu, useContextMenu } from "react-contexify"

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
}

export const Dropdown: <T extends string>(props: DropdownProps<T>) => JSX.Element = (props) => {
  const { options, value, defaultValue, onChange, readOnly, width = 130 } = props

  const id = useId()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedValue, setSelectedValue] = useState(() => defaultValue)

  const { show, hideAll } = useContextMenu({ id })

  const menuPosition = useRef<{ x: number, y: number }>()
  const menuWidth = useRef<number>(0)

  const triggerRef = useRef<HTMLButtonElement>(null)

  function getMenuPosition() {
    if (triggerRef.current) {
      const { left, bottom, width } = triggerRef.current.getBoundingClientRect()
      menuPosition.current = { x: left, y: bottom + 2 }
      menuWidth.current = width
    }
    return menuPosition.current
  }

  const handleMenuTrigger = (e: React.MouseEvent) => {
    if (isVisible || readOnly) {
      hideAll()
      return
    }

    show({
      event: e,
      position: getMenuPosition()
    })
  }

  const handleKeyboard = (e: React.KeyboardEvent) => {
    switch (e.key) {
    case "Enter":
      show({
        event: e,
        position: getMenuPosition()
      })
      break
    case "Escape":
      if (isVisible) {
        hideAll()
      }
      break
    }
  }

  const handleSelect = (params: ItemParams<any, Option<any>>) => {
    if (params.data) {
      const newSelectedValue = params.data.value
      setSelectedValue(newSelectedValue)

      if (onChange) {
        onChange(newSelectedValue)
      }
    }

    hideAll()
  }

  const handleVisibility = (isVisible: boolean) => {
    setIsVisible(isVisible)
  }

  const handleScroll = () => {
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
          <img src={Icons.ChevronDown} />
        </span>
      </button>

      <Menu
        className="DropdownMenu"
        id={id}
        style={{ minWidth: menuWidth.current, maxWidth: menuWidth.current }}
        onVisibilityChange={handleVisibility}
      >
        {options.map((option) => (
          <Item
            key={option.value}
            onClick={handleSelect}
            data={option}
            className={option.value === selectedValue ? "selected" : ""}
          >
            <div>
              <span>{option.label}</span>
            </div>
          </Item>
        ))}
      </Menu>
    </div>
  )
}
