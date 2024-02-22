import { type FC } from "react"

import { SecondarySidebarSection } from "src/components/sidebar/SecondarySidebar"
import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { appletComponentService } from "src/services/applet-component-service"
import { type AppletOption } from "src/types/AppletOption"
import { type InputComponentProps } from "src/types/InputComponentProps"

export const AppletOptions = () => {
  const options = useSelector(() => activeAppletStore.getActiveApplet().options)
  const readOnly = useSelector(() => activeAppletStore.getActiveApplet().isDeleted)

  if (options.length === 0) {
    return null
  }

  return (
    <SecondarySidebarSection title="Options" padding>
      {options.map((option) => (
        <div key={option.key} className="AppletSidebarItem">
          <AppletSidebarItem
            option={option}
            readOnly={readOnly}
          />
        </div>
      ))}
    </SecondarySidebarSection>
  )
}

const AppletSidebarItem = ({ option, readOnly }: { option: AppletOption, readOnly: boolean }) => {
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
      onValueChange={handleValueChange}
      readOnly={readOnly}
    />
  )
}
