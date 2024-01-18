import { clsx } from "clsx"
import { observer } from "mobx-react"
import { useEffect } from "react"
import { showMenu } from "tauri-plugin-context-menu"
import "simplebar-react/dist/simplebar.min.css"

import { interfaceStore } from "src/stores/interfaceStore.ts"

import { AppSidebar } from "./components/app/AppSidebar"
import { AppSidebarContent } from "./components/app/AppSidebarContent"
import { AppStatusbar } from "./components/app/AppStatusbar"
import { AppTitlebar } from "./components/app/AppTitlebar"
import { AppWindowSizeListener } from "./components/app/AppWindowSizeListener"
import { AppWindowSizeObserver } from "./components/app/AppWindowSizeObserver"
import { ToolPage } from "./pages/ToolPage"
import { toolStore } from "./stores/toolStore.js"

const AppRoot = observer(({ children }: any) => {
  const { theme } = interfaceStore

  return (
    <div className={clsx("AppRoot", theme)}>
      {children}
    </div>
  )
})

export const App = () => {
  useEffect(() => {
    toolStore.initTools()

    void showMenu({
      items: [
        {
          label: "Item 1",
          disabled: false,
          event: "item1clicked",
          payload: "Hello World!",
          shortcut: "ctrl+M",
          subitems: [
            {
              label: "Subitem 1",
              disabled: true,
              event: "subitem1clicked"
            },
            {
              is_separator: true
            },
            {
              label: "Subitem 2",
              disabled: false,
              checked: true,
              event: "subitem2clicked"
            }
          ]
        }
      ]
    })
  }, [])

  return (
    <AppRoot>
      <AppWindowSizeListener />
      <AppWindowSizeObserver />
      <AppTitlebar />

      <div className="AppContainer">
        <AppSidebar />

        <div className="AppContent">
          <AppSidebarContent />
          <ToolPage />
        </div>
      </div>

      <AppStatusbar />
    </AppRoot>
  )
}
