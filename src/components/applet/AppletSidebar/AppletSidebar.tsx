import clsx from "clsx"
import { type FC } from "react"
import SimpleBar from "simplebar-react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletComponentService } from "src/services/applet-component-service"
import { appletSidebarService } from "src/services/applet-sidebar-service"
import { type InputComponentProps } from "src/types/InputComponentProps"

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
          <div key={option.key} className="AppletSidebarItem">
            <div className="AppletSidebarItem-label">
              {option.label}
            </div>
            <div className="AppletSidebarItem-value">
              <AppletSidebarComponent
                component={option.component}
                props={option.props}
              />
            </div>
          </div>
        ))}
        <div className="AppletSidebarItem">
          <Button icon={Icons.Check}>Apply</Button>
        </div>
      </div>
    </SimpleBar>
  )
}

const AppletSidebarComponent = ({ component, props = {} }: { component: string, props: any }) => {
  const inputComponent = appletComponentService.getInputComponent(component as any)
  const Component: FC<InputComponentProps<any>> = inputComponent.component

  return <Component {...props} />
}
