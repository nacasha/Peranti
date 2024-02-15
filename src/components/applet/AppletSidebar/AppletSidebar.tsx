import clsx from "clsx"
import { type FC } from "react"
import SimpleBar from "simplebar-react"

import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletSidebarService } from "src/services/applet-sidebar-service"

import { appletSidebarClasses } from "./AppletSidebar.css"

export const AppletSidebar: FC = () => {
  const isOpen = useSelector(() => appletSidebarService.isOpen)
  const options = useSelector(() => activeAppletStore.getActiveApplet().options)

  const className = clsx([
    appletSidebarClasses.root,
    {
      [appletSidebarClasses.rootShow]: isOpen
    }
  ])

  return (
    <SimpleBar className={className}>
      <div className={appletSidebarClasses.inner}>
        {options.map((option) => (
          <div key={option.kbd} className="AppletSidebarItem">
            <div className="AppletSidebarItem-label">
              {option.label}
            </div>
            <div className="AppletSidebarItem-value">
            4
            </div>
          </div>
        ))}
      </div>
    </SimpleBar>
  )
}
