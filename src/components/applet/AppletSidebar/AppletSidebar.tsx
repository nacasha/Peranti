import clsx from "clsx"
import { type FC } from "react"
import SimpleBar from "simplebar-react"

import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletComponentService } from "src/services/applet-component-service"
import { appletSidebarService } from "src/services/applet-sidebar-service"
import { type AppletOption } from "src/types/AppletOption"
import { type InputComponentProps } from "src/types/InputComponentProps"

import { appletSidebarClasses } from "./AppletSidebar.css"

export const AppletSidebar: FC = () => {
  const isOpen = useSelector(() => appletSidebarService.isOpen)
  const options = useSelector(() => activeAppletStore.getActiveApplet().options)
  const activeAppletSessionId = useSelector(() => activeAppletStore.getActiveApplet().sessionId)
  const readOnly = useSelector(() => activeAppletStore.getActiveApplet().isDeleted)

  const className = clsx([
    appletSidebarClasses.root,
    {
      [appletSidebarClasses.rootShow]: isOpen
    }
  ])

  return (
    <SimpleBar key={activeAppletSessionId} className={className}>
      <div className={appletSidebarClasses.inner}>
        {options.map((option) => (
          <div key={option.key} className="AppletSidebarItem">
            <AppletSidebarComponent
              option={option}
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>
    </SimpleBar>
  )
}

const AppletSidebarComponent = ({ option, readOnly }: { option: AppletOption, readOnly: boolean }) => {
  const { component, key, props } = option

  const activeAppletOptionValues = useSelector(() => activeAppletStore.getActiveApplet().optionValues[key])
  const defaultValue = activeAppletOptionValues ?? option.defaultValue
  const inputComponent = appletComponentService.getInputComponent(component)
  const Component: FC<InputComponentProps<any>> = inputComponent.component

  const handleValueChange = (value: unknown) => {
    activeAppletStore.getActiveApplet().setOptionValue(key, value)
  }

  return (
    <Component
      {...props}
      label={option.label}
      defaultValue={defaultValue}
      onSubmit={handleValueChange}
      readOnly={readOnly}
    />
  )
}
