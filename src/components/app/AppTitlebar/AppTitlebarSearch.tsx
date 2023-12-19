import { observer } from "mobx-react"
import { type FC, useRef, useState, useEffect } from "react"
import useOnclickOutside from "react-cool-onclickoutside"

import { type Tool } from "src/models/Tool"
import { toolStore } from "src/stores/toolStore"
import { listOfTools } from "src/tools"

interface SearchCompoenntProps {
  onClickOutside: () => any
}

const SearchCompoennt: FC<SearchCompoenntProps> = (props) => {
  const { onClickOutside } = props
  const [tools, setTools] = useState(listOfTools)

  const onSearchChange: React.InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    const value = event.target.value
    const filteredTools = listOfTools.filter((tool) => tool.name.toLocaleLowerCase().includes(value.toLocaleLowerCase()))
    setTools(filteredTools)
  }

  const componentRef = useOnclickOutside(onClickOutside)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClickOutside()
        event.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // ------

  const firstTabIndexRef = useRef<HTMLDivElement | null>(null)
  const lastTabIndexRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Initialize tabIndex references when the component mounts
    const focusableElements = document.querySelectorAll<HTMLDivElement>("[tabindex]:not([tabindex=\"-1\"])")
    if (focusableElements.length > 0) {
      firstTabIndexRef.current = focusableElements[0]
      lastTabIndexRef.current = focusableElements[focusableElements.length - 1]
    }
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault()
      navigateTabIndex(event.key === "ArrowUp" ? "previous" : "next")
    }
  }

  const navigateTabIndex = (direction: "previous" | "next") => {
    const currentFocusedElement = document.activeElement as HTMLDivElement
    const focusableElements = document.querySelectorAll<HTMLDivElement>("[tabindex]:not([tabindex=\"-1\"])")

    if (focusableElements.length === 0) {
      return
    }

    const currentIndex = Array.from(focusableElements).indexOf(currentFocusedElement)
    let nextIndex

    if (direction === "next") {
      nextIndex = currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1
    } else {
      nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1
    }

    (focusableElements[nextIndex] as HTMLElement).focus()
  }

  const onClickItem = (tool: Tool) => () => {
    toolStore.openTool(tool)
    onClickOutside()
  }

  return (
    <div ref={componentRef} className="ToolSearchResult" onKeyDown={handleKeyDown}>
      <input tabIndex={0} className="search" autoFocus onChange={onSearchChange} />
      <div className="list">
        {tools.map((tool, index) => (
          <button
            key={tool.toolId}
            className="ToolSearchResult-item"
            tabIndex={index + 1}
            onClick={onClickItem(tool)}
          >
            {tool.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export const AppTitlebarSearch = observer(() => {
  const [isOpen, setIsOpen] = useState(false)

  const onClickSearch = () => {
    setIsOpen(!isOpen)
  }

  const handleClickOutside = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        setIsOpen(true)
        event.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <div className="AppTitlebarSearch">
      <div className="left-padding"></div>
      <div className="ToolSearch" onClick={onClickSearch}>
        {toolStore.getActiveToolName()}
      </div>
      <div className="right-padding"></div>

      {isOpen && <SearchCompoennt onClickOutside={handleClickOutside} />}
    </div>
  )
})
