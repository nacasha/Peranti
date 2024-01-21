import { clsx } from "clsx"
import React, { type FC, useState } from "react"
import useOnclickOutside from "react-cool-onclickoutside"

import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { useSelector } from "src/hooks/useSelector"
import { hotkeysStore } from "src/stores/hotkeysStore"
import { toolRunnerStore } from "src/stores/toolRunnerStore"
import { toolSessionStore } from "src/stores/toolSessionStore"
import { toolStore } from "src/stores/toolStore"
import { type ToolConstructor } from "src/types/ToolConstructor"

import "./ToolSearchBar.scss"

export const ToolSearchBar = () => {
  const activeToolName = useSelector(() => toolRunnerStore.getActiveTool().name)

  const [isOpen, setIsOpen] = useState(false)

  const onClickSearch = () => {
    setIsOpen(!isOpen)
  }

  const onClickOutsideSearch = () => {
    setIsOpen(false)
  }

  useHotkeysModified(hotkeysStore.keys.OPEN_SEARCH, (event) => {
    event.preventDefault()
    setIsOpen(true)
  })

  return (
    <div className="ToolSearchBar">
      <div className="left-padding"></div>
      <div className="ToolSearch" onClick={onClickSearch}>
        {activeToolName}
      </div>
      <div className="right-padding"></div>

      {isOpen && <SearchComponent onClickOutside={onClickOutsideSearch} />}
    </div>
  )
}

interface SearchComponentProps {
  onClickOutside: () => any
}

const SearchComponent: FC<SearchComponentProps> = (props) => {
  const { onClickOutside } = props
  const [tools, setTools] = useState(() => toolStore.listOfTools)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSearchChange: React.InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    const value = event.target.value
    const filteredTools = toolStore.listOfTools
      .filter((tool) => tool.name.toLocaleLowerCase().includes(value.toLocaleLowerCase()))

    setTools(filteredTools)
    setSelectedIndex(0)
  }

  const componentRef = useOnclickOutside(onClickOutside)

  const onKeyDownArrow = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setSelectedIndex((oldIndex) => {
        const newIndex = oldIndex - 1
        if (newIndex < 0) {
          return tools.length - 1
        }
        return newIndex
      })
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      setSelectedIndex((oldIndex) => {
        const newIndex = oldIndex + 1
        if (newIndex > tools.length - 1) {
          return 0
        }
        return newIndex
      })
    } else if (event.key === "Enter") {
      const tool = tools[selectedIndex]

      if (tool) {
        onClickItem(tool)()
      }
    }
  }

  const onClickItem = (tool: ToolConstructor) => () => {
    toolSessionStore.findOrCreateSession(tool)
    onClickOutside()
  }

  useHotkeysModified(hotkeysStore.keys.ESCAPE, (event) => {
    event.preventDefault()
    onClickOutside()
  })

  return (
    <div ref={componentRef} className="ToolSearchResult" onKeyDown={onKeyDownArrow}>
      <input tabIndex={0} className="search" autoFocus onChange={onSearchChange} />
      <div className="list">
        {tools.map((tool, index) => (
          <button
            key={tool.toolId}
            className={clsx("ToolSearchResult-item", selectedIndex === index && "hover")}
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
