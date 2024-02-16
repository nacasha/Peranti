import clsx from "clsx"
import { type FC } from "react"
import SimpleBar from "simplebar-react"

import { AppletBatchMode } from "src/components/secondary-sidebar/AppletBatchMode"
import { AppletOptions } from "src/components/secondary-sidebar/AppletOptions"
import { AppletSampleSelector } from "src/components/secondary-sidebar/AppletSampleSelector"
import { AppTitleBarStyle } from "src/enums/app-titlebar-style"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletSidebarService } from "src/services/applet-sidebar-service"
import { interfaceStore } from "src/services/interface-store"

import { secondarySidebarClasses } from "./SecondarySidebar.css"

export const SecondarySidebarCommandbar: FC = () => {
  const isShow = useSelector(() => interfaceStore.appTitlebarStyle === AppTitleBarStyle.Commandbar)

  if (isShow) {
    return <SecondarySidebar />
  }
  return null
}

export const SecondarySidebarTabbar: FC = () => {
  const isShow = useSelector(() => interfaceStore.appTitlebarStyle === AppTitleBarStyle.Tabbar)

  if (isShow) {
    return <SecondarySidebar />
  }
  return null
}

const SecondarySidebar: FC = () => {
  const isOpen = useSelector(() => appletSidebarService.isOpen)
  const activeAppletSessionId = useSelector(() => activeAppletStore.getActiveApplet().sessionId)

  const className = clsx([
    secondarySidebarClasses.root,
    {
      [secondarySidebarClasses.rootShow]: isOpen
    }
  ])

  return (
    <SimpleBar key={activeAppletSessionId} className={className}>
      <AppletSampleSelector />
      <AppletBatchMode />
      <AppletOptions />
    </SimpleBar>
  )
}
