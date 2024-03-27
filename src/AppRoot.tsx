import NiceModal from "@ebay/nice-modal-react"
import clsx from "clsx"
import { useEffect, type FC, type ReactNode } from "react"

import { AppTitleBarStyle } from "./enums/app-titlebar-style.ts"
import { useSelector } from "./hooks/useSelector.ts"
import { interfaceStore } from "./services/interface-store.ts"
import { isRunningInTauri } from "./utils/is-running-in-tauri.ts"

export const AppRoot: FC<{ children: ReactNode }> = ({ children }) => {
  const titlebarStyle = useSelector(() => interfaceStore.appTitlebarStyle)
  const isWindowMaximized = useSelector(() => interfaceStore.isWindowMaximized)
  const textAreaWordWrap = useSelector(() => interfaceStore.textAreaWordWrap)

  const classNames = clsx("AppRoot", {
    withMaximized: isWindowMaximized,
    withNotMaximized: !isWindowMaximized,
    withTextAreaWordWrap: textAreaWordWrap,
    withTabbar: titlebarStyle === AppTitleBarStyle.Tabbar,
    withRunningInTauri: isRunningInTauri,
    withRunningInBrowser: !isRunningInTauri
  })

  useEffect(() => {
    const disableContextMenu = () => {
      if (window.location.hostname !== "tauri.localhost") {
        return
      }

      document.addEventListener("contextmenu", e => {
        e.preventDefault()
        return false
      }, { capture: true })
    }

    disableContextMenu()
  }, [])

  return (
    <NiceModal.Provider>
      <div className={classNames}>
        {children}
      </div>
    </NiceModal.Provider>
  )
}
