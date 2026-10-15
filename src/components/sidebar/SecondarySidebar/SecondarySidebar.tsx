import clsx from "clsx"
import { type FC } from "react"
import SimpleBar from "simplebar-react"

import { AppletOptions } from "src/components/secondary-sidebar/AppletOptions"
import { AppletSampleSelector } from "src/components/secondary-sidebar/AppletSampleSelector"
import { PipelineOptions } from "src/components/secondary-sidebar/PipelineOptions"
import { SidebarResizeHandle } from "src/components/sidebar/SidebarResizeHandle"
import { SecondarySidebarWidth } from "src/constants/sidebar-width"
import { AppTitleBarStyle } from "src/enums/app-titlebar-style"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"
import { secondarySidebarService } from "src/services/secondary-sidebar-service"

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
  const isOpen = useSelector(() => secondarySidebarService.isOpen)
  const width = useSelector(() => interfaceStore.secondarySidebarWidth)

  const className = clsx(["SecondarySidebar", { show: isOpen }])

  return (
    <div className={className}>
      <SimpleBar className="SecondarySidebar-body">
        <PipelineOptions />
        <AppletSampleSelector />
        <AppletOptions />
      </SimpleBar>
      {isOpen && (
        <SidebarResizeHandle
          edge="left"
          width={width}
          defaultWidth={SecondarySidebarWidth.default}
          onResize={(newWidth) => { interfaceStore.setSecondarySidebarWidth(newWidth) }}
        />
      )}
    </div>
  )
}
