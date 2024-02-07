import { clsx } from "clsx"
import React, { type FC, useState } from "react"
import useOnclickOutside from "react-cool-onclickoutside"

import { useHotkeysModified } from "src/hooks/useHotkeysModified"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletStore } from "src/services/applet-store"
import { hotkeysStore } from "src/services/hotkeys-store"
import { sessionStore } from "src/services/session-store"
import { type AppletConstructor } from "src/types/AppletConstructor"

import "./AppletSearchBar.scss"

export const AppletSearchBar = () => {
  const activeAppletName = useSelector(() => activeAppletStore.getActiveApplet().name)

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
    <div className="AppletSearchBar">
      <div className="left-padding"></div>
      <div className="AppletSearch" onClick={onClickSearch}>
        {activeAppletName}
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
  const [applets, setApplets] = useState(() => appletStore.listOfLoadedApplets)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSearchChange: React.InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    const value = event.target.value
    const filteredApplets = appletStore.listOfLoadedApplets
      .filter((applet) => applet.name.toLocaleLowerCase().includes(value.toLocaleLowerCase()))

    setApplets(filteredApplets)
    setSelectedIndex(0)
  }

  const componentRef = useOnclickOutside(onClickOutside)

  const onKeyDownArrow = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setSelectedIndex((oldIndex) => {
        const newIndex = oldIndex - 1
        if (newIndex < 0) {
          return applets.length - 1
        }
        return newIndex
      })
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      setSelectedIndex((oldIndex) => {
        const newIndex = oldIndex + 1
        if (newIndex > applets.length - 1) {
          return 0
        }
        return newIndex
      })
    } else if (event.key === "Enter") {
      const applet = applets[selectedIndex]

      if (applet) {
        onClickItem(applet)()
      }
    }
  }

  const onClickItem = (appletConstructor: AppletConstructor) => () => {
    sessionStore.findOrCreateSession(appletConstructor)
    onClickOutside()
  }

  useHotkeysModified(hotkeysStore.keys.ESCAPE, (event) => {
    event.preventDefault()
    onClickOutside()
  })

  return (
    <div ref={componentRef} className="AppletSearchResult" onKeyDown={onKeyDownArrow}>
      <input tabIndex={0} className="search" autoFocus onChange={onSearchChange} />
      <div className="list">
        {applets.map((applet, index) => (
          <button
            key={applet.appletId}
            className={clsx("AppletSearchResult-item", selectedIndex === index && "hover")}
            tabIndex={index + 1}
            onClick={onClickItem(applet)}
          >
            {applet.name}
          </button>
        ))}
      </div>
    </div>
  )
}
