import clsx from "clsx"
import { type FC } from "react"
import SimpleBar from "simplebar-react"

import { AppletBatchMode } from "src/components/secondary-sidebar/AppletBatchMode"
import { AppletInfo } from "src/components/secondary-sidebar/AppletInfo"
import { AppletOptions } from "src/components/secondary-sidebar/AppletOptions"
import { AppletSampleSelector } from "src/components/secondary-sidebar/AppletSampleSelector"
import { PipelineOptions } from "src/components/secondary-sidebar/PipelineOptions"
import { AppTitleBarStyle } from "src/enums/app-titlebar-style"
import { useSelector } from "src/hooks/useSelector"
import { appletSidebarService } from "src/services/applet-sidebar-service"
import { interfaceStore } from "src/services/interface-store"

import "./SecondarySidebar.scss"

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

  const className = clsx(["SecondarySidebar", { show: isOpen }])

  return (
    <SimpleBar className={className}>
      <AppletInfo />
      <PipelineOptions />
      <AppletSampleSelector />
      <AppletBatchMode />
      <AppletOptions />
    </SimpleBar>
  )
}
