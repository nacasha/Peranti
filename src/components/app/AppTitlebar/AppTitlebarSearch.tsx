import { clsx } from "clsx"
import { observer } from "mobx-react"
import React, { type FC, useRef, useState, useEffect } from "react"
import useOnclickOutside from "react-cool-onclickoutside"

import { type Tool } from "src/models/Tool"
import { toolStore } from "src/stores/toolStore"
import { listOfTools } from "src/tools"

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

      {isOpen && <SearchComponent onClickOutside={handleClickOutside} />}
    </div>
  )
})

interface SearchComponentProps {
  onClickOutside: () => any
}

const SearchComponent: FC<SearchComponentProps> = (props) => {
  const { onClickOutside } = props
  const [tools, setTools] = useState(listOfTools)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSearchChange: React.InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    const value = event.target.value
    const filteredTools = listOfTools.filter((tool) => tool.name.toLocaleLowerCase().includes(value.toLocaleLowerCase()))
    setTools(filteredTools)
    setSelectedIndex(0)
  }

  const componentRef = useOnclickOutside(onClickOutside)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
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

  const onClickItem = (tool: Tool) => () => {
    toolStore.openTool(tool)
    onClickOutside()
  }

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

  return (
    <div ref={componentRef} className="ToolSearchResult" onKeyDown={handleKeyDown}>
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
